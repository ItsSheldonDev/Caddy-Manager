<!--
+--------------------------------------------------+
| Caddy Manager                                    |
| Version: 1.0.0                                   |
| Dev: Marius.B (ItsSheldonDev)                   |
| Path: ./src/routes/sites/[id]/edit/+page.svelte |
+--------------------------------------------------+
-->

<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { Site } from '@prisma/client';
  
  let site: Site | null = null;
  let siteType = '';
  let formErrors: Record<string, string> = {};
  let submitting = false;
  let loading = true;
  let error: string | null = null;
  
  // Pour les champs de formulaire
  let name = '';
  let domain = '';
  let targetUrl = '';
  let preservePath = true;
  let stripPrefix = false;
  let headers = '';
  
  const headerPlaceholder = JSON.stringify({"X-Forwarded-Host": "example.com"}, null, 2);
  
  onMount(async () => {
    try {
      const id = $page.params.id;
      const response = await fetch(`/api/sites/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      site = await response.json();
      
      // Initialiser les variables avec les données du site
      if (site) { // Vérification pour TypeScript
        name = site.name;
        domain = site.domain;
        siteType = site.type;
        
        if (site.type === 'reverse_proxy' && site.config) {
          targetUrl = (site.config as any).targetUrl || '';
          preservePath = (site.config as any).preservePath !== false;
          stripPrefix = (site.config as any).stripPrefix === true;
          
          if ((site.config as any).headers) {
            headers = JSON.stringify((site.config as any).headers, null, 2);
          }
        }
      }
      
      loading = false;
    } catch (err) {
      loading = false;
      error = err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement du site';
    }
  });
  
  function validateForm(formData: FormData): boolean {
    formErrors = {};
    const name = formData.get('name') as string;
    const domain = formData.get('domain') as string;
    const targetUrl = formData.get('targetUrl') as string;
    
    let isValid = true;
    
    if (!name || name.trim() === '') {
      formErrors.name = 'Le nom du site est requis';
      isValid = false;
    }
    
    if (!domain || domain.trim() === '') {
      formErrors.domain = 'Le domaine est requis';
      isValid = false;
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(domain)) {
      formErrors.domain = 'Le domaine n\'est pas valide';
      isValid = false;
    }
    
    if (siteType === 'reverse_proxy') {
      if (!targetUrl || targetUrl.trim() === '') {
        formErrors.targetUrl = 'L\'URL cible est requise';
        isValid = false;
      } else {
        try {
          new URL(targetUrl);
        } catch (e) {
          formErrors.targetUrl = 'L\'URL cible n\'est pas valide';
          isValid = false;
        }
      }
    }
    
    return isValid;
  }
</script>

<div class="max-w-3xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Modifier le site</h1>
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
      <div class="mb-6">
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            class={`px-4 py-2 text-sm font-medium rounded-lg ${siteType === 'reverse_proxy' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            disabled
          >
            {siteType === 'reverse_proxy' ? 'Reverse Proxy' : 'Site Statique'}
          </button>
        </div>
        <p class="mt-2 text-sm text-gray-500">Le type de site ne peut pas être modifié après la création.</p>
      </div>
      
      <form 
        method="POST" 
        action={`/api/sites/${site.id}`}
        use:enhance={() => {
          submitting = true;
          
          return async ({ formElement, result }) => {
            submitting = false;
            
            if (result.type === 'success') {
              goto('/sites?updated=true');
            }
          };
        }}
        on:submit|preventDefault={(e) => {
          const form = e.currentTarget;
          const formData = new FormData(form);
          
          if (validateForm(formData)) {
            form.submit();
          }
        }}
      >
        <input type="hidden" name="_method" value="PATCH" />
        <input type="hidden" name="type" value={siteType} />
        
        <div class="space-y-4">
          <!-- Champ Nom -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nom du site</label>
            <input
              type="text"
              id="name"
              name="name"
              class="mt-1 block w-full rounded-md {formErrors.name ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
              placeholder="Mon site web"
              value={name}
              on:input={(e) => name = e.currentTarget.value}
            />
            {#if formErrors.name}
              <p class="mt-1 text-sm text-red-600">{formErrors.name}</p>
            {/if}
          </div>
          
          <!-- Champ Domaine -->
          <div>
            <label for="domain" class="block text-sm font-medium text-gray-700">Domaine</label>
            <input
              type="text"
              id="domain"
              name="domain"
              class="mt-1 block w-full rounded-md {formErrors.domain ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
              placeholder="example.com"
              value={domain}
              on:input={(e) => domain = e.currentTarget.value}
            />
            {#if formErrors.domain}
              <p class="mt-1 text-sm text-red-600">{formErrors.domain}</p>
            {/if}
          </div>
          
          {#if siteType === 'reverse_proxy'}
            <!-- Champs spécifiques Reverse Proxy -->
            <div>
              <label for="targetUrl" class="block text-sm font-medium text-gray-700">URL cible</label>
              <input
                type="text"
                id="targetUrl"
                name="targetUrl"
                class="mt-1 block w-full rounded-md {formErrors.targetUrl ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                placeholder="http://localhost:3000"
                value={targetUrl}
                on:input={(e) => targetUrl = e.currentTarget.value}
              />
              {#if formErrors.targetUrl}
                <p class="mt-1 text-sm text-red-600">{formErrors.targetUrl}</p>
              {/if}
            </div>
            
            <!-- Options avancées Reverse Proxy -->
            <details open>
              <summary class="text-sm font-medium text-gray-700 cursor-pointer py-2">Options avancées</summary>
              <div class="pl-4 space-y-4 mt-2">
                <div>
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="preservePath"
                      name="preservePath"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={preservePath}
                      on:change={(e) => preservePath = e.currentTarget.checked}
                    />
                    <label for="preservePath" class="ml-2 block text-sm text-gray-700">Préserver le chemin (path)</label>
                  </div>
                </div>
                
                <div>
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      id="stripPrefix"
                      name="stripPrefix"
                      class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={stripPrefix}
                      on:change={(e) => stripPrefix = e.currentTarget.checked}
                    />
                    <label for="stripPrefix" class="ml-2 block text-sm text-gray-700">Supprimer le préfixe</label>
                  </div>
                </div>
                
                <div>
                  <label for="headers" class="block text-sm font-medium text-gray-700">En-têtes personnalisés (JSON)</label>
                  <textarea
                    id="headers"
                    name="headers"
                    rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder={headerPlaceholder}
                    value={headers}
                    on:input={(e) => headers = e.currentTarget.value}
                  ></textarea>
                </div>
              </div>
            </details>
          {/if}
          
          <!-- Bouton de soumission -->
          <div class="pt-4">
            <button
              type="submit"
              disabled={submitting}
              class="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Modification en cours...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </form>
    </div>
  {/if}
</div>