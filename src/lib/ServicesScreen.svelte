<script>
  import { miniapp } from "./miniapp";
  import {
    selectedService,
    serviceMode,
    currentScreen,
    locationData,
    showToast,
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
        showToast("تعذر تحديد الموقع. يرجى تفعيل الـ GPS.", "error");
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
      showToast("يرجى الانتظار حتى يتم تحديد الموقع", "info");
      serviceMode.set("home"); // Force retry
      return;
    }
    selectedService.set(pkg);
    currentScreen.set("payment");
  }

  // --- Map Login ---
  import { tick } from "svelte";
  let map;

  $: if ($serviceMode === "home" && $locationData) {
    initMap($locationData);
  }

  async function initMap(loc) {
    await tick();
    if (!document.getElementById("map")) return;

    if (map) {
      map.remove();
      map = null;
    }

    if (window.L) {
      map = L.map("map", {
        center: [loc.latitude, loc.longitude],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        map,
      );

      // Blue dot marker
      const icon = L.divIcon({
        className: "custom-div-icon",
        html: "<div style='background-color:#3b82f6; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(59,130,246,0.6);'></div>",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      L.marker([loc.latitude, loc.longitude], { icon: icon }).addTo(map);
    }
  }
</script>

<div class="px-4 py-6 w-full max-w-md mx-auto pb-24 relative z-10">
  <h2
    class="text-3xl font-bold text-white text-center mb-6 tracking-tight drop-shadow-lg"
  >
    اختر باقة التنظيف
  </h2>

  <!-- Mode Selector (Moved to Top for Better UX) -->
  <div
    class="glass-card p-1.5 rounded-2xl flex mb-8 relative overflow-hidden ring-1 ring-white/10"
  >
    <button
      class="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative z-10 flex flex-col items-center justify-center gap-1
      {$serviceMode === 'shop'
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-400 hover:text-white hover:bg-white/5'}"
      on:click={() => setMode("shop")}
    >
      <span>🏢 داخل المركز</span>
    </button>
    <button
      class="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex flex-col items-center justify-center gap-1 relative z-10
      {$serviceMode === 'home'
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-gray-400 hover:text-white hover:bg-white/5'}"
      on:click={() => setMode("home")}
    >
      <div class="flex items-center gap-2">
        {#if loadingLoc}
          <span
            class="w-3 h-3 border-2 border-white/80 border-t-transparent rounded-full animate-spin"
          ></span>
        {/if}
        <span>🏠 خدمة منزلية</span>
      </div>
      <span class="text-[10px] opacity-80 font-mono text-blue-200"
        >+5,000 IQD</span
      >
    </button>
  </div>

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

  {#if $serviceMode === "home" && $locationData}
    <div
      class="glass-card p-4 rounded-2xl animate-fade-in relative overflow-hidden"
    >
      <div class="flex items-center justify-between mb-3 px-1">
        <div class="flex items-center gap-2 text-green-400">
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
          <span class="font-bold text-sm">موقعك الحالي</span>
        </div>
        <button
          class="text-xs text-blue-300 hover:text-white underline"
          on:click={() => setMode("home")}>تحديث</button
        >
      </div>

      <!-- Map Container -->
      <div
        id="map"
        class="w-full h-40 rounded-xl bg-gray-900 border border-white/10 z-0"
      ></div>

      <p class="text-xs text-gray-400 mt-3 font-mono text-center">
        {$locationData.address || "GPS Coordinates Received"}
      </p>
    </div>
  {/if}
</div>

<style>
  .bg-blue-900_20 {
    background-color: rgba(30, 58, 138, 0.3);
  }
</style>
