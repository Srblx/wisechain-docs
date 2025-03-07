document.addEventListener("DOMContentLoaded", function() {
    // Initialisation de Mermaid avec des options supplémentaires
    mermaid.initialize({ 
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        gitGraph: {
            showBranches: true,
            showCommitLabel: true
        }
    });
});