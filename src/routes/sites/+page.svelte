<!--
+------------------------------------------+
| Caddy Manager                            |
| Version: 1.0.0                           |
| Dev: Marius.B (ItsSheldonDev)           |
| Path: ./src/routes/sites/+page.svelte   |
+------------------------------------------+
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
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
  
  async function toggleSiteStatus(id: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/sites/${id}/toggle-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      
      if (!response.ok) throw new Error('Impossible de modifier le statut du site');
      
      // Mettre à jour l'état local
      sites = sites.map(site => 
        site.id === id ? { ...site, enabled: !site.enabled } : site
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  }
</script>

<div class="space-y-6">
  {#if $page.url.searchParams.get('created') === 'true'}
    <div class="p-4 bg-green-50 border border-green-200 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm leading-5 font-medium text-green-800">
            Le site a été créé avec succès.
          </p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button 
              class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:bg-green-100 transition ease-in-out duration-150"
              on:click={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('created');
                window.history.replaceState({}, '', url.toString());
              }}
              aria-label="Fermer la notification"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else if $page.url.searchParams.get('updated') === 'true'}
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm leading-5 font-medium text-blue-800">
            Le site a été mis à jour avec succès.
          </p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button 
              class="inline-flex rounded-md p-1.5 text-blue-500 hover:bg-blue-100 focus:outline-none focus:bg-blue-100 transition ease-in-out duration-150"
              on:click={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('updated');
                window.history.replaceState({}, '', url.toString());
              }}
              aria-label="Fermer la notification"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else if $page.url.searchParams.get('deleted') === 'true'}
    <div class="p-4 bg-red-50 border border-red-200 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm leading-5 font-medium text-red-800">
            Le site a été supprimé avec succès.
          </p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button 
              class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:bg-red-100 transition ease-in-out duration-150"
              on:click={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('deleted');
                window.history.replaceState({}, '', url.toString());
              }}
              aria-label="Fermer la notification"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <div class="flex justify-between items-center">
    <h1 class="text-2xl font-bold text-gray-900">Gestion des sites</h1>
    <a href="/sites/new" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
      Ajouter un site
    </a>
  </div>
  
  <!-- Tableau des sites -->
  <div class="bg-white shadow overflow-hidden rounded-lg">
    {#if isLoading}
      <div class="p-6 text-center">Chargement...</div>
    {:else if error}
      <div class="p-6 text-center text-red-600">{error}</div>
    {:else if sites.length === 0}
      <div class="p-6 text-center text-gray-500">Aucun site configuré</div>
    {:else}
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domaine</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each sites as site}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{site.name}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{site.domain}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class={`px-2 py-1 text-xs rounded-full ${site.type === 'reverse_proxy' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                  {site.type === 'reverse_proxy' ? 'Reverse Proxy' : 'Statique'}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class={`px-2 py-1 text-xs rounded-full ${site.enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {site.enabled ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    on:click={() => toggleSiteStatus(site.id, site.enabled)}
                    class={`px-3 py-1 rounded-md text-xs ${site.enabled ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'}`}
                  >
                    {site.enabled ? 'Désactiver' : 'Activer'}
                  </button>
                  <a 
                    href={`/sites/${site.id}/edit`}
                    class="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md text-xs"
                  >
                    Modifier
                  </a>
                  <a 
                    href={`/sites/${site.id}/delete`}
                    class="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-xs"
                  >
                    Supprimer
                  </a>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>