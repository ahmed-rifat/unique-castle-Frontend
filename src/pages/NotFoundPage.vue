<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
    <div class="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-black text-2xl">
        404
      </div>
      <h2 class="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p class="text-xs text-slate-500 mt-2 leading-relaxed">
        The requested page does not exist or has been relocated within the Unique Castle portal.
      </p>
      <div class="mt-6">
        <router-link
          to="/dashboard"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
        >
          Return to Dashboard &rarr;
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>
