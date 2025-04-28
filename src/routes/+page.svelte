<!-- src/routes/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import type { Site } from '@prisma/client';
    
    let sites: Site[] = [];
    let isLoading = true;
    let error: string | null = null;
    
    onMount(async () => {
      try {
        const response = await fetch('/api/sites');
        if (!response.ok) throw new Error('Impossible de charger les sites');
        sites = await response.json();
      } catch (err) {
        error = err instanceof Error ? err.message : 'Une erreur est survenue';
      } finally {
        isLoading = false;
      }
    });
  </script>
  
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <a href="/sites/new" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Ajouter un site
      </a>
    </div>
    
    <!-- Statistiques -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900">Sites actifs</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">
          {isLoading ? '...' : sites.filter(site => site.enabled).length}
        </p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900">Reverse Proxy</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">
          {isLoading ? '...' : sites.filter(site => site.type === 'reverse_proxy').length}
        </p>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900">Sites Statiques</h3>
        <p class="text-3xl font-bold text-purple-600 mt-2">
          {isLoading ? '...' : sites.filter(site => site.type === 'static').length}
        </p>
      </div>
    </div>
    
    <!-- Liste des sites récents -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-6 border-b">
        <h2 class="text-lg font-medium text-gray-900">Sites récents</h2>
      </div>
      
      {#if isLoading}
        <div class="p-6 text-center">Chargement...</div>
      {:else if error}
        <div class="p-6 text-center text-red-600">{error}</div>
      {:else if sites.length === 0}
        <div class="p-6 text-center text-gray-500">Aucun site configuré</div>
      {:else}
        <ul class="divide-y divide-gray-200">
          {#each sites.slice(0, 5) as site}
            <li class="p-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{site.name}</h3>
                  <p class="text-sm text-gray-500">{site.domain}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span class={`px-2 py-1 text-xs rounded-full ${site.type === 'reverse_proxy' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                    {site.type === 'reverse_proxy' ? 'Reverse Proxy' : 'Statique'}
                  </span>
                  <span class={`px-2 py-1 text-xs rounded-full ${site.enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {site.enabled ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </li>
          {/each}
        </ul>
        
        {#if sites.length > 5}
          <div class="p-4 border-t text-center">
            <a href="/sites" class="text-blue-600 hover:text-blue-800">Voir tous les sites</a>
          </div>
        {/if}
      {/if}
    </div>
  </div>