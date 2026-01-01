import { mount } from 'svelte';
import './app.css'
import App from './App.svelte'

let app;
try {
  const target = document.getElementById('app');
  target.innerHTML = ''; // Clear loading text
  app = mount(App, {
    target: target,
  });
  console.log("App mounted successfully");
} catch (e) {
  console.error("App failed to mount", e);
  document.getElementById('app').innerHTML = `<div style="color:red; padding:20px; text-align:center">Error Mounting App: ${e.message}</div>`;
}

export default app;
