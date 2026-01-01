<script>
    import { toast } from "./store";
    import { fly, fade } from "svelte/transition";
</script>

{#if $toast}
    <div
        class="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md min-w-[300px] justify-center"
        class:bg-green-500_20={$toast.type === "success"}
        class:border-green-500_50={$toast.type === "success"}
        class:bg-red-500_20={$toast.type === "error"}
        class:border-red-500_50={$toast.type === "error"}
        class:bg-blue-500_20={$toast.type === "info"}
        class:border-blue-500_50={$toast.type === "info"}
        transition:fly={{ y: -50, duration: 300 }}
    >
        {#if $toast.type === "success"}
            <span class="text-2xl">✅</span>
        {:else if $toast.type === "error"}
            <span class="text-2xl">❌</span>
        {:else}
            <span class="text-2xl">ℹ️</span>
        {/if}

        <p class="font-bold text-white">{$toast.message}</p>
    </div>
{/if}

<style>
    .bg-green-500_20 {
        background-color: rgba(34, 197, 94, 0.85);
    }
    .border-green-500_50 {
        border-color: rgba(34, 197, 94, 0.5);
    }

    .bg-red-500_20 {
        background-color: rgba(239, 68, 68, 0.85);
    }
    .border-red-500_50 {
        border-color: rgba(239, 68, 68, 0.5);
    }

    .bg-blue-500_20 {
        background-color: rgba(59, 130, 246, 0.85);
    }
    .border-blue-500_50 {
        border-color: rgba(59, 130, 246, 0.5);
    }
</style>
