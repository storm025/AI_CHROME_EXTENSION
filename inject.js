(function() {
    function getUserCodeFromPage() {
        // Extract problem ID from URL
        const urlParts = window.location.pathname.split("/");
        const problemSlug = urlParts[urlParts.length - 1];
        const problemId = problemSlug.split("-").pop();
        
        if (!problemId || isNaN(problemId)) {
            console.log("Could not extract valid problem ID");
            return;
        }
        
        const editorLanguage = localStorage.getItem("editor-language");
        
        // Search for the user code in localStorage
        let userCode = null;

        
        for(let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key.includes("course_") && key.includes(problemId) && 
               (editorLanguage ? key.includes(editorLanguage) : true)) {
                userCode = localStorage.getItem(key);
                break;
            }
        }
        
        // If no exact match found, try a more relaxed approach
        if (!userCode) {
            for(let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if(key.includes("course_") && key.includes(problemId)) {
                    userCode = localStorage.getItem(key);
                    break;
                }
            }
        }
        
        // Send the data to content script using a custom event
        window.dispatchEvent(new CustomEvent('USER_CODE_FOUND', { 
            detail: {
                problemId,
                editorLanguage,
                code: userCode,
            }
        }));
    }
    
    // Listen for requests from content script
    window.addEventListener('GET_USER_CODE', function() {
        getUserCodeFromPage();
    });
    
    // Announce that the script is loaded
    window.dispatchEvent(new CustomEvent('INJECT_SCRIPT_LOADED'));
})();