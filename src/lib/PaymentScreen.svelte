<script>
    import { miniapp } from "./miniapp";
    import {
        user,
        selectedService,
        serviceMode,
        locationData,
        currentScreen,
        orderDetails,
        ordersHistory,
        loyaltyPoints,
    } from "./store";

    let processing = false;
    let success = false;
    let orderId = null;
    let earnedPoints = 0; // Track earned points

    let phone = "";
    let notes = "";

    // New Feature State
    let deviceImage = null;
    let selectedProblem = null;
    const problems = [
        "حرارة عالية 🔥",
        "بطء شديد 🐢",
        "صوت مزعج للمروحة 🔊",
        "تنظيف دوري فقط 🧹",
        "مشكلة أخرى ❓",
    ];

    async function pickImage() {
        try {
            const res = await miniapp.chooseImage();
            // In miniapp docs, res.apFilePaths is an array of local paths
            if (res && res.apFilePaths && res.apFilePaths.length > 0) {
                deviceImage = res.apFilePaths[0]; // Display the local path directly
            }
        } catch (e) {
            console.error("Choose Image Failed", e);
            // Optionally alert if strict
        }
    }

    $: deliveryFee = $serviceMode === "home" ? 5000 : 0;
    $: totalAmount = ($selectedService?.price || 0) + deliveryFee;

    async function pay() {
        if (!phone && $serviceMode === "home") {
            alert("يرجى إدخال رقم الهاتف للتواصل");
            return;
        }

        processing = true;
        try {
            // 1. Get Payment URL
            const authToken = $user?.token || "mock_token_for_dev";
            let paymentUrl;

            if (miniapp.isNative()) {
                try {
                    const res = await fetch(
                        "https://its.mouamle.space/api/payment",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: authToken,
                            },
                            body: JSON.stringify({
                                amount: totalAmount, // Send Total
                                serviceId: $selectedService.id,
                                mode: $serviceMode,
                                phone: phone,
                                notes: notes,
                                problem: selectedProblem, // New
                                image: deviceImage
                                    ? "attached_local_path"
                                    : null, // Just flagging it for now as we can't upload easily without multipart
                            }),
                        },
                    );
                    const data = await res.json();
                    paymentUrl = data.url;
                } catch (apiErr) {
                    console.error("Payment API Failed", apiErr);
                    alert("فشل إنشاء طلب الدفع");
                    processing = false;
                    return;
                }
            } else {
                paymentUrl =
                    "https://www.wallet.com/cashier?orderId=mock_" + Date.now();
            }

            // 2. Call Native Payment
            const res = await miniapp.tradePay(paymentUrl);

            if (res.resultCode === "9000") {
                success = true;
                orderId = "ORD-" + Math.floor(Math.random() * 1000000);

                const newOrder = {
                    id: orderId,
                    service: $selectedService,
                    mode: $serviceMode,
                    total: totalAmount,
                    date: new Date().toISOString(),
                    status: "pending", // Initial Status
                    statusText: "بانتظار الموافقة",
                    phone: phone,
                    problem: selectedProblem,
                };

                orderDetails.set(newOrder);
                ordersHistory.update((h) => [newOrder, ...h]);
            } else {
                alert("تم إلغاء الدفع");
            }
        } catch (e) {
            console.error(e);
            alert("حدث خطأ غير متوقع");
        } finally {
            processing = false;
        }
    }

    function goHome() {
        success = false;
        currentScreen.set("services");
    }
</script>

<div class="px-4 py-6 w-full max-w-md mx-auto h-full flex flex-col pt-4">
    {#if !success}
        <div class="flex items-center justify-between mb-6">
            <button
                class="text-white/70 hover:text-white"
                on:click={() => currentScreen.set("services")}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
            <h2 class="text-2xl font-bold text-white">تأكيد الطلب</h2>
            <div class="w-6"></div>
        </div>

        <div
            class="glass-card p-6 rounded-[2rem] flex-grow mb-4 flex flex-col relative z-10 border-t border-white/20 overflow-y-auto"
        >
            <!-- Receipt Header -->
            <div class="text-center mb-6 pb-6 border-b border-white/10">
                <div class="text-gray-400 text-sm mb-1">الخدمة المختارة</div>
                <div class="text-xl font-bold text-white">
                    {$selectedService?.name}
                </div>
                <div class="text-blue-300 text-sm mt-1">
                    {$serviceMode === "home"
                        ? "🏠 خدمة منزلية"
                        : "🏢 داخل المركز"}
                </div>
            </div>

            <!-- Breakdown -->
            <div class="space-y-3 mb-6">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">سعر الخدمة</span>
                    <span class="text-white font-mono"
                        >{$selectedService?.price.toLocaleString()}</span
                    >
                </div>

                {#if deliveryFee > 0}
                    <div class="flex justify-between text-sm">
                        <span class="text-blue-300">أجور نقل (خدمة منزلية)</span
                        >
                        <span class="text-blue-300 font-mono"
                            >+{deliveryFee.toLocaleString()}</span
                        >
                    </div>
                {/if}

                <div
                    class="border-t border-dashed border-white/20 my-2 pt-2 flex justify-between items-end"
                >
                    <span class="text-white font-bold">المجموع الكلي</span>
                    <span class="text-2xl font-bold text-green-400 font-mono">
                        {totalAmount.toLocaleString()}
                        <span class="text-xs text-gray-500">IQD</span>
                    </span>
                </div>
            </div>

            <!-- Inputs -->
            <div class="space-y-4">
                <!-- Image Upload (Bonus) -->
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5 mr-1"
                        >صورة الجهاز (اختياري)</label
                    >
                    <div class="flex gap-3">
                        {#if deviceImage}
                            <div
                                class="relative w-20 h-20 rounded-xl overflow-hidden border border-white/20 group"
                            >
                                <img
                                    src={deviceImage}
                                    alt="Device"
                                    class="w-full h-full object-cover"
                                />
                                <button
                                    class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    on:click={() => (deviceImage = null)}
                                >
                                    <svg
                                        class="w-5 h-5 text-red-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        /></svg
                                    >
                                </button>
                            </div>
                        {:else}
                            <button
                                class="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-500 hover:text-blue-400 hover:border-blue-400/50 hover:bg-blue-400/5 transition-all gap-1"
                                on:click={pickImage}
                            >
                                <svg
                                    class="w-6 h-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                    /><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                    /></svg
                                >
                                <span class="text-[9px]">أضف صورة</span>
                            </button>
                        {/if}
                    </div>
                </div>

                <!-- Problem Description -->
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5 mr-1"
                        >وصف المشكلة</label
                    >
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        {#each problems as p}
                            <button
                                class="text-xs py-2 px-3 rounded-lg border transition-all text-right
                                {selectedProblem === p
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}"
                                on:click={() => (selectedProblem = p)}
                            >
                                {p}
                            </button>
                        {/each}
                    </div>
                </div>

                <div>
                    <label class="block text-xs text-gray-400 mb-1.5 mr-1"
                        >رقم الهاتف (للتواصل)</label
                    >
                    <input
                        type="tel"
                        bind:value={phone}
                        placeholder="0770xxxxxxx"
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:bg-blue-500/10 transition-all font-mono text-right"
                    />
                </div>

                <div>
                    <label class="block text-xs text-gray-400 mb-1.5 mr-1"
                        >ملاحظات إضافية (اختياري)</label
                    >
                    <textarea
                        bind:value={notes}
                        rows="2"
                        placeholder="تفاصيل أخرى..."
                        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:bg-blue-500/10 transition-all text-right text-sm"
                    ></textarea>
                </div>

                {#if $serviceMode === "home" && $locationData}
                    <div
                        class="bg-blue-500/10 rounded-xl p-3 flex items-start gap-3 border border-blue-500/20"
                    >
                        <svg
                            class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                        </svg>
                        <div class="text-xs text-gray-300 leading-relaxed">
                            سيتم إرسال الفني إلى: <br />
                            <span class="text-white font-semibold"
                                >{$locationData.address ||
                                    "إحداثيات الخريطة المحددة"}</span
                            >
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Payment Button -->
        <div class="mt-auto mb-6">
            <button
                on:click={pay}
                disabled={processing}
                class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white w-full py-4 rounded-2xl font-bold text-xl shadow-xl shadow-blue-900/50 border border-white/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {#if processing}
                    <svg
                        class="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        ></circle>
                        <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    جاري تأكيد الحجز...
                {:else}
                    <span>دفع وتأكيد</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-6 w-6 opacity-75"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                {/if}
            </button>

            <button
                on:click={() => currentScreen.set("services")}
                class="mt-4 w-full py-3 text-gray-400 hover:text-white font-medium transition-colors text-sm"
            >
                الرجوع لتعديل الطلب
            </button>
        </div>
    {:else}
        <!-- SUCCESS STATE -->
        <div
            class="flex-grow flex flex-col items-center justify-center text-center animate-fade-in py-10"
        >
            <div class="relative mb-8">
                <div
                    class="absolute inset-0 bg-green-500 rounded-full blur-[40px] opacity-20"
                ></div>
                <div
                    class="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl relative z-10 border border-green-400/30"
                >
                    <svg
                        class="h-12 w-12 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="3"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
            </div>

            <h2 class="text-3xl font-bold text-white mb-2 drop-shadow-sm">
                تم الحجز!
            </h2>
            <p class="text-gray-400 mb-10 text-lg">
                شكراً لك، طلبك قيد المعالجة الآن
            </p>

            <div
                class="glass-card p-8 rounded-3xl w-full mb-8 relative overflow-hidden border-t border-white/20"
            >
                <div
                    class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"
                ></div>

                <p
                    class="text-sm text-gray-500 mb-2 uppercase tracking-wider font-bold"
                >
                    رقم الطلب Reference
                </p>
                <p
                    class="text-3xl font-mono font-bold text-white tracking-widest mb-6 drop-shadow-md select-all"
                >
                    {orderId}
                </p>

                <div
                    class="bg-white p-4 rounded-xl inline-block shadow-inner mx-auto"
                >
                    <!-- Simulated QR -->
                    <div
                        class="w-32 h-32 bg-gray-900 rounded-lg flex items-center justify-center text-gray-500 text-[10px] font-mono border-2 border-dashed border-gray-700"
                    >
                        QR CODE AREA
                    </div>
                </div>
                <p class="mt-4 text-xs text-gray-500">
                    يرجى إبراز هذا الرمز للموظف
                </p>

                {#if earnedPoints > 0}
                    <div
                        class="mt-4 bg-yellow-400/10 border border-yellow-400/20 p-3 rounded-xl flex items-center justify-center gap-2"
                    >
                        <span class="text-xl">💎</span>
                        <span class="text-yellow-400 font-bold"
                            >حصلت على {earnedPoints} نقطة ولاء!</span
                        >
                    </div>
                {/if}
            </div>

            <button
                on:click={goHome}
                class="btn-primary w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-blue-500/20"
                >العودة للرئيسية</button
            >
        </div>
    {/if}
</div>

<style>
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>
