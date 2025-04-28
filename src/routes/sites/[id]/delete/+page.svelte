<!--
+---------------------------------------------------+
| Caddy Manager                                     |
| Version: 1.0.0                                    |
| Dev: Marius.B (ItsSheldonDev)                    |
| Path: ./src/routes/sites/[id]/delete/+page.svelte |
+---------------------------------------------------+
-->

<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { Site } from '@prisma/client';
  
  let site: Site | null = null;
  let loading = true;
  let error: string | null = null;
  let submitting = false;
  
  onMount(async () => {
    try {
      const id = $page.params.id;
      const response = await fetch(`/api/sites/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      site = await response.json();
      loading = false;
    } catch (err) {
      loading = false;
      error = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement du site';
    }
  });
</script>

<div class="max-w-3xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Supprimer le site</h1>
    <a href="/sites" class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md">
      Retour à la liste
    </a>
  </div>
  
  {#if loading}
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
      <p class="text-center mt-4 text-gray-500">Chargement du site...</p>
    </div>
  {:else if error}
    <div class="bg-red-50 p-6 rounded-lg shadow border border-red-200">
      <h2 class="text-lg font-medium text-red-700 mb-2">Erreur</h2>
      <p class="text-red-600">{error}</p>
      <div class="mt-4">
        <a href="/sites" class="text-blue-600 hover:underline">Retour à la liste des sites</a>
      </div>
    </div>
  {:else if site}
    <div class="bg-white shadow rounded-lg p-6">
      <div class="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">Attention</h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>
                Vous êtes sur le point de supprimer le site <strong>{site.name}</strong> ({site.domain}).
                Cette action est irréversible et supprimera également la configuration dans Caddy.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Détails du site</h3>
        <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Nom</dt>
            <dd class="mt-1 text-sm text-gray-900">{site.name}</dd>
          </div>
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Domaine</dt>
            <dd class="mt-1 text-sm text-gray-900">{site.domain}</dd>
          </div>
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Type</dt>
            <dd class="mt-1 text-sm">
              <span class={`px-2 py-1 text-xs rounded-full ${site.type === 'reverse_proxy' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                {site.type === 'reverse_proxy' ? 'Reverse Proxy' : 'Statique'}
              </span>
            </dd>
          </div>
          <div class="sm:col-span-1">
            <dt class="text-sm font-medium text-gray-500">Statut</dt>
            <dd class="mt-1 text-sm">
              <span class={`px-2 py-1 text-xs rounded-full ${site.enabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {site.enabled ? 'Actif' : 'Inactif'}
              </span>
            </dd>
          </div>
          {#if site.type === 'reverse_proxy' && site.config}
            <div class="sm:col-span-2">
              <dt class="text-sm font-medium text-gray-500">URL cible</dt>
              <dd class="mt-1 text-sm text-gray-900">{(site.config as any).targetUrl}</dd>
            </div>
          {/if}
        </dl>
      </div>
      
      <form 
        method="POST" 
        action="/api/sites/{site.id}"
        use:enhance={() => {
          submitting = true;
          
          return async ({ formElement, result }) => {
            submitting = false;
            
            if (result.type === 'success') {
              goto('/sites?deleted=true');
            }
          };
        }}
      >
        <input type="hidden" name="_method" value="DELETE" />
        
        <div class="space-y-4">
          <!-- Confirmation -->
          <div>
            <label class="flex items-center">
              <input
                type="checkbox"
                name="confirm"
                required
                class="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span class="ml-2 block text-sm text-gray-700">
                Je confirme vouloir supprimer ce site et sa configuration Caddy
              </span>
            </label>
          </div>
          
          <!-- Boutons -->
          <div class="pt-4 flex space-x-4">
            <a 
              href="/sites"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </a>
            <button
              type="submit"
              disabled={submitting}
              class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {submitting ? 'Suppression en cours...' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </form>
    </div>
  {/if}
</div>