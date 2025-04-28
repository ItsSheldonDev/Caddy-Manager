<!-- src/routes/caddy-status/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    let status: any = null;
    let isLoading = true;
    let error: string | null = null;
    
    onMount(async () => {
      try {
        const response = await fetch('/api/caddy-status');
        status = await response.json();
      } catch (err) {
        error = err instanceof Error ? err.message : 'Une erreur est survenue';
      } finally {
        isLoading = false;
      }
    });
  </script>
  
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Statut de la connexion Caddy</h1>
    
    {#if isLoading}
      <div class="bg-white p-6 rounded-lg shadow">
        <p class="text-gray-500">Vérification de la connexion à l'API Caddy...</p>
      </div>
    {:else if error}
      <div class="bg-red-50 p-6 rounded-lg shadow border border-red-200">
        <h2 class="text-lg font-medium text-red-700 mb-2">Erreur de connexion</h2>
        <p class="text-red-600">{error}</p>
      </div>
    {:else if status.status === 'error'}
      <div class="bg-red-50 p-6 rounded-lg shadow border border-red-200">
        <h2 class="text-lg font-medium text-red-700 mb-2">Erreur de connexion à Caddy</h2>
        <p class="text-red-600">{status.message}</p>
        {#if status.code}
          <p class="mt-2 text-sm text-red-500">Code d'erreur: {status.code}</p>
        {/if}
        <div class="mt-4 p-4 bg-red-100 rounded text-sm">
          <p class="font-medium">Vérifiez que :</p>
          <ul class="list-disc ml-5 mt-2 space-y-1">
            <li>Le conteneur Docker Caddy est bien démarré</li>
            <li>L'API Caddy est exposée sur le port 2019</li>
            <li>L'URL de l'API est correctement configurée dans votre .env</li>
            <li>Aucun problème de réseau n'empêche la connexion</li>
          </ul>
        </div>
      </div>
    {:else}
      <div class="bg-green-50 p-6 rounded-lg shadow border border-green-200">
        <h2 class="text-lg font-medium text-green-700 mb-2">Connexion établie avec succès</h2>
        <p class="text-green-600">{status.message}</p>
        {#if status.version}
          <p class="mt-2 text-sm text-green-500">Version: {status.version}</p>
        {/if}
      </div>
      
      <div class="mt-6 bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium mb-3">Configuration Caddy</h3>
        <pre class="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">{JSON.stringify(status.data, null, 2)}</pre>
      </div>
    {/if}
    
    <div class="mt-6">
      <a href="/" class="text-blue-600 hover:underline">Retour au dashboard</a>
    </div>
  </div>