<script lang="ts">
	import '../styles.css';
	import { page } from '$app/stores';
	
	const navItems = [
	  { label: 'Dashboard', href: '/' },
	  { label: 'Sites', href: '/sites' },
	  { label: 'Certificats', href: '/certificates' },
	  { label: 'Paramètres', href: '/settings' }
	];
  </script>
  
  <div class="min-h-screen bg-gray-50 flex flex-col">
	<!-- Header -->
	<header class="bg-white shadow">
	  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
		<div class="flex justify-between items-center">
		  <div class="flex items-center space-x-2">
			<h1 class="text-xl font-bold text-blue-600">Caddy Manager</h1>
		  </div>
		  <div>
			<!-- Profile / Auth Menu -->
		  </div>
		</div>
	  </div>
	</header>
	
	<div class="flex-grow flex">
	  <!-- Sidebar -->
	  <aside class="w-64 bg-white border-r hidden md:block">
		<nav class="p-4 space-y-1">
		  {#each navItems as item}
			<a 
			  href={item.href} 
			  class="block px-4 py-2 rounded-md {$page.url.pathname === item.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}"
			>
			  {item.label}
			</a>
		  {/each}
		</nav>
	  </aside>
	  
	  <!-- Main content -->
	  <main class="flex-grow p-6">
		<slot />
	  </main>
	</div>
  </div>