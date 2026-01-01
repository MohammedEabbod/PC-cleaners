<script>
  import StartScreen from "./lib/StartScreen.svelte";
  import ServicesScreen from "./lib/ServicesScreen.svelte";
  import PaymentScreen from "./lib/PaymentScreen.svelte";
  import HistoryScreen from "./lib/HistoryScreen.svelte"; // Import History
  import { currentScreen, loyaltyPoints } from "./lib/store";
  import { fade, fly } from "svelte/transition";
</script>

<main
  class="min-h-screen w-full overflow-hidden relative font-sans text-white pb-20 bg-[#0f172a]"
>
  <!-- Decorative Background blobs (Adjusted for Dark Mode) -->
  <div
    class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"
  ></div>
  <div
    class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-1000"
  ></div>

  <!-- Points Badge (Top Left) -->
  {#if $currentScreen !== "start"}
    <div
      class="absolute top-4 left-4 z-50 flex items-center gap-2 glass-card px-3 py-1.5 rounded-full border border-yellow-500/30 bg-black/20"
      transition:fly={{ y: -20 }}
    >
      <span class="text-xl">💎</span>
      <span class="font-bold text-yellow-400 font-mono">{$loyaltyPoints}</span>
    </div>
  {/if}

  {#if $currentScreen === "start"}
    <div in:fade out:fade><StartScreen /></div>
  {:else if $currentScreen === "services"}
    <div in:fly={{ x: 200, duration: 300 }} out:fade><ServicesScreen /></div>
  {:else if $currentScreen === "payment"}
    <div in:fly={{ x: 200, duration: 300 }} out:fade><PaymentScreen /></div>
  {:else if $currentScreen === "history"}
    <div in:fly={{ x: -200, duration: 300 }} out:fade><HistoryScreen /></div>
  {/if}

  <!-- Bottom Navigation (Only show if not in start/payment/splash) -->
  {#if $currentScreen === "services" || $currentScreen === "history"}
    <nav
      class="fixed bottom-0 left-0 w-full bg-black/40 backdrop-blur-xl border-t border-white/10 p-4 flex justify-around z-50 pb-8 safe-area-pb"
    >
      <button
        class="flex flex-col items-center gap-1 opacity-70 transition-all {$currentScreen ===
        'services'
          ? 'opacity-100 text-blue-400 scale-110'
          : 'hover:opacity-100'}"
        on:click={() => currentScreen.set("services")}
      >
        <svg
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          /></svg
        >
        <span class="text-[10px] font-bold">الرئيسية</span>
      </button>

      <button
        class="flex flex-col items-center gap-1 opacity-70 transition-all {$currentScreen ===
        'history'
          ? 'opacity-100 text-blue-400 scale-110'
          : 'hover:opacity-100'}"
        on:click={() => currentScreen.set("history")}
      >
        <svg
          class="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          /></svg
        >
        <span class="text-[10px] font-bold">طلباتي</span>
      </button>
    </nav>
  {/if}
</main>
