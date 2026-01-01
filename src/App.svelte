<script>
  import StartScreen from "./lib/StartScreen.svelte";
  import ServicesScreen from "./lib/ServicesScreen.svelte";
  import PaymentScreen from "./lib/PaymentScreen.svelte";
  import { currentScreen } from "./lib/store";
</script>

<main class="min-h-screen w-full overflow-hidden relative font-sans text-white">
  <!-- Decorative Background blobs (Adjusted for Dark Mode) -->
  <div
    class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none"
  ></div>
  <div
    class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[120px] pointer-events-none"
  ></div>

  {#if $currentScreen === "start"}
    <StartScreen />
  {:else if $currentScreen === "services"}
    <ServicesScreen />
  {:else if $currentScreen === "payment"}
    <PaymentScreen />
  {/if}
</main>
