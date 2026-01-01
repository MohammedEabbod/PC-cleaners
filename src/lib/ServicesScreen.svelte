<script>
  import { miniapp } from "./miniapp";
  import {
    selectedService,
    serviceMode,
    currentScreen,
    locationData,
  } from "./store";

  const services = [
    {
      id: 1,
      name: "تنظيف سوفتوير",
      price: 15000,
      desc: "تسريع النظام وإزالة الفيروسات",
    },
    {
      id: 2,
      name: "تنظيف هاردوير",
      price: 25000,
      desc: "تنظيف الغبار وتغيير المعجون الحراري",
    },
    {
      id: 3,
      name: "تنظيف شامل",
      price: 35000,
      desc: "سوفتوير + هاردوير (الأكثر طلباً)",
      popular: true,
    },
  ];

  let loadingLoc = false;

  async function setMode(mode) {
    serviceMode.set(mode);
    if (mode === "home") {
      loadingLoc = true;
      try {
        const loc = await miniapp.getLocation();
        locationData.set(loc);
      } catch (e) {
        console.error("Location failed", e);
        alert("تعذر تحديد الموقع. يرجى تفعيل الـ GPS.");
        serviceMode.set("shop"); // revert
      } finally {
        loadingLoc = false;
      }
    } else {
      locationData.set(null);
    }
  }

  function select(pkg) {
    if ($serviceMode === "home" && !$locationData) {
      alert("يرجى الانتظار حتى يتم تحديد الموقع");
      return;
    }
    selectedService.set(pkg);
    currentScreen.set("payment");
  }
</script>

<div class="px-4 py-6 w-full max-w-md mx-auto pb-24 relative z-10">
  <h2
    class="text-3xl font-bold text-white text-center mb-8 tracking-tight drop-shadow-lg"
  >
    اختر باقة التنظيف
  </h2>

  <!-- Packages -->
  <div class="space-y-6 mb-10">
    {#each services as pkg}
      <button
        class="glass-card p-6 rounded-3xl relative transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-right w-full block group overflow-hidden"
        class:border-blue-400={pkg.popular}
        class:bg-blue-900_20={pkg.popular}
        on:click={() => select(pkg)}
      >
        <!-- Hover Glow -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
        ></div>

        {#if pkg.popular}
          <div
            class="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-br-xl shadow-lg z-10"
          >
            الأكثر طلباً
          </div>
        {/if}

        <div class="flex justify-between items-center mb-3">
          <h3
            class="text-xl font-bold text-white group-hover:text-blue-300 transition-colors"
          >
            {pkg.name}
          </h3>
          <span
            class="text-blue-300 font-bold bg-blue-500/20 px-3 py-1 rounded-lg text-sm border border-blue-500/30"
          >
            {pkg.price.toLocaleString()} IQD
          </span>
        </div>

        <p class="text-gray-400 text-sm mb-5 font-light leading-relaxed">
          {pkg.desc}
        </p>

        <div
          class="w-full py-3 rounded-xl bg-white/10 text-white text-sm font-bold border border-white/5 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all shadow-lg"
        >
          اختيار الباقة
        </div>
      </button>
    {/each}
  </div>

  <!-- Mode Selector -->
  <div class="glass-card p-1.5 rounded-2xl flex mb-6 relative overflow-hidden">
    <!-- Animated Background Slider could be added here for extra polish -->
    <button
      class="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative z-10
      {$serviceMode === 'shop'
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-400 hover:text-white hover:bg-white/5'}"
      on:click={() => setMode("shop")}
    >
      داخل المركز
    </button>
    <button
      class="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 relative z-10
      {$serviceMode === 'home'
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-400 hover:text-white hover:bg-white/5'}"
      on:click={() => setMode("home")}
    >
      {#if loadingLoc}
        <span
          class="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"
        ></span>
      {/if}
      خدمة منزلية
    </button>
  </div>

  {#if $serviceMode === "home" && $locationData}
    <div
      class="glass-card p-4 rounded-2xl flex items-center gap-4 text-sm text-green-300 bg-green-900/20 border-green-500/30 animate-fade-in"
    >
      <div
        class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          /><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          /></svg
        >
      </div>
      <div>
        <p class="font-bold text-white mb-0.5">تم تحديد موقعك بنجاح</p>
        <p class="text-xs opacity-70 font-mono">
          {$locationData.address || "GPS Coordinates Received"}
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .bg-blue-900_20 {
    background-color: rgba(30, 58, 138, 0.3);
  }
</style>
