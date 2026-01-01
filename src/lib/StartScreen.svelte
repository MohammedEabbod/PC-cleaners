<script>
    import { miniapp } from "./miniapp";
    import { user, currentScreen } from "./store";

    let isLoading = false;

    async function handleStart() {
        isLoading = true;
        try {
            const authRes = await miniapp.getAuthCode();
            console.log("Auth Code Received:", authRes.authCode);

            let userData = null;

            if (miniapp.isNative()) {
                // Call Real Backend as requested
                try {
                    const response = await fetch(
                        "https://its.mouamle.space/api/auth-with-superQi",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token: authRes.authCode }),
                        },
                    );

                    if (!response.ok) throw new Error("Backend Auth Failed");

                    const data = await response.json();
                    userData = {
                        id:
                            data.id ||
                            "hylid_usr_" + authRes.authCode.substring(0, 5),
                        name: data.name || "Hylid User",
                        email: data.email,
                        token: data.token, // Store for payment
                    };
                } catch (backendErr) {
                    console.error("Backend Error:", backendErr);
                    alert("فشل الاتصال بالسيرفر، سيتم استخدام وضع الضيف");
                    userData = { id: "guest_" + Date.now(), name: "Guest" };
                }
            } else {
                // Dev Mock
                userData = { id: "dev_user_123", name: "Dev User" };
            }

            user.set(userData);
            currentScreen.set("services");
        } catch (e) {
            console.error("Auth Failed", e);
            alert("Authentication Failed: " + JSON.stringify(e));
        } finally {
            isLoading = false;
        }
    }
</script>

<div
    class="flex flex-col items-center justify-center h-screen w-full p-6 text-center overflow-hidden relative"
>
    <!-- Decorative Background Glow -->
    <div
        class="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/30 rounded-full blur-[100px]"
    ></div>
    <div
        class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"
    ></div>

    <div
        class="glass-card p-10 rounded-[2.5rem] w-full max-w-sm flex flex-col items-center animate-fade-in relative z-10 border-t border-white/20"
    >
        <div
            class="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/40 rotate-3 transform hover:rotate-6 transition-transform duration-500"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
            </svg>
        </div>

        <h1 class="text-4xl font-bold text-white mb-2 tracking-tight">
            PC Cleaners
        </h1>
        <p class="text-gray-300 mb-12 text-lg font-light">
            خدمة تنظيف احترافية لحاسوبك
        </p>

        <button
            on:click={handleStart}
            disabled={isLoading}
            class="btn-primary w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center hover:scale-[1.02] transition-transform"
        >
            {#if isLoading}
                <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                جاري الاتصال...
            {:else}
                استمرار
            {/if}
        </button>
    </div>
</div>

<style>
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
