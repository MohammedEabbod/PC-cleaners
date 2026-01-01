<script>
    import { ordersHistory, currentScreen } from "./store";
    import { onMount, onDestroy } from "svelte";

    // --- Order Status Simulation Logic ---
    // Mapping status keys to display text and colors
    const statusMap = {
        pending: {
            text: "بانتظار الموافقة",
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
        },
        accepted: {
            text: "جاري إرسال فني",
            color: "text-blue-400",
            bg: "bg-blue-400/10",
        },
        working: {
            text: "قيد الصيانة 🛠️",
            color: "text-purple-400",
            bg: "bg-purple-400/10",
        },
        completed: {
            text: "تم الإنجاز ✅",
            color: "text-green-400",
            bg: "bg-green-400/10",
        },
        cancelled: {
            text: "ملغي ❌",
            color: "text-red-400",
            bg: "bg-red-400/10",
        },
    };

    let timers = [];

    onMount(() => {
        // Find orders that need simulation (pending ones)
        const history = $ordersHistory;
        let updated = false;

        const newHistory = history.map((order) => {
            // Only simulate recent orders if they are pending
            if (order.status === "pending") {
                updated = true;
                simulateOrder(order.id);
                return order; // will be updated via store update in simulateOrder
            }
            return order;
        });
    });

    function simulateOrder(orderId) {
        // After 3 seconds -> Accepted
        const t1 = setTimeout(() => updateStatus(orderId, "accepted"), 3000);
        // After 8 seconds -> Working
        const t2 = setTimeout(() => updateStatus(orderId, "working"), 8000);
        // After 15 seconds -> Completed
        const t3 = setTimeout(() => updateStatus(orderId, "completed"), 15000);

        timers.push(t1, t2, t3);
    }

    function updateStatus(id, newStatus) {
        ordersHistory.update((orders) => {
            return orders.map((o) => {
                if (o.id === id) {
                    return { ...o, status: newStatus };
                }
                return o;
            });
        });
    }

    onDestroy(() => {
        timers.forEach((t) => clearTimeout(t));
    });
</script>

<div class="px-4 py-8 w-full max-w-md mx-auto min-h-screen flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-white">سجل الطلبات</h2>
        <button
            on:click={() => currentScreen.set("services")}
            class="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-white transition-colors"
        >
            طلب جديد +
        </button>
    </div>

    <!-- List -->
    <div class="space-y-4 flex-grow overflow-y-auto pb-20">
        {#if $ordersHistory.length === 0}
            <div class="text-center py-20 opacity-50">
                <p class="text-4xl mb-4">📜</p>
                <p>لا توجد طلبات سابقة</p>
            </div>
        {/if}

        {#each $ordersHistory as order (order.id)}
            <div
                class="glass-card p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all"
            >
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-bold text-white text-lg">
                            {order.service.name}
                        </h3>
                        <p class="text-xs text-gray-400 font-mono mt-1">
                            {order.date.split("T")[0]}
                        </p>
                    </div>
                    <div
                        class={`px-3 py-1 rounded-lg text-xs font-bold ${statusMap[order.status]?.color || "text-gray-400"} ${statusMap[order.status]?.bg || "bg-gray-800"}`}
                    >
                        {statusMap[order.status]?.text || order.status}
                    </div>
                </div>

                <div
                    class="flex justify-between items-end border-t border-white/5 pt-3"
                >
                    <span class="text-gray-400 text-sm">{order.id}</span>
                    <span class="font-bold text-blue-300 font-mono"
                        >{order.total.toLocaleString()} IQD</span
                    >
                </div>

                <!-- Progress Bar logic for active orders -->
                {#if order.status !== "completed" && order.status !== "cancelled"}
                    <div
                        class="w-full bg-gray-700 h-1 mt-4 rounded-full overflow-hidden"
                    >
                        <div
                            class="h-full bg-blue-500 transition-all duration-1000"
                            style="width: {order.status === 'pending'
                                ? '20%'
                                : order.status === 'accepted'
                                  ? '50%'
                                  : order.status === 'working'
                                    ? '80%'
                                    : '100%'}"
                        ></div>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
</div>
