// Injected script to extract user code from the page
(function () {
    function getUserCodeFromPage() {
        const urlParts = window.location.pathname.split("/");
        const problemSlug = urlParts[urlParts.length - 1];
        const problemId = problemSlug.split("-").pop();
        
        if (!problemId || isNaN(problemId)) {
            console.log("Could not extract valid problem ID");
            return;
        }
        
        const editorLanguage = localStorage.getItem("editor-language");
        let userCode = null;

        if (editorLanguage) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes("course_") && key.includes(problemId) && key.includes(editorLanguage)) {
                    userCode = localStorage.getItem(key);
                    break;
                }
            }
        }

        if (!userCode) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes("course_") && key.includes(problemId)) {
                    userCode = localStorage.getItem(key);
                    break;
                }
            }
        }

        if (userCode) {
            window.dispatchEvent(new CustomEvent("USER_CODE_UPDATED", {
                detail: { problemId, editorLanguage, code: userCode }
            }));
        }
    }

    // Run every second to check for code updates in localStorage
    setInterval(getUserCodeFromPage, 1000);

    // Also allow manual trigger from content.js
    window.addEventListener("GET_USER_CODE", getUserCodeFromPage);
    
    window.dispatchEvent(new CustomEvent("INJECT_SCRIPT_LOADED"));
})();


// Injected script to intercept problem data API calls
(function () {
    function interceptProblemData() {
        const originalOpen = XMLHttpRequest.prototype.open;
        
        XMLHttpRequest.prototype.open = function (method, url) {
            if (url.includes("https://api2.maang.in/problems/user/")) {
                this.addEventListener("load", function () {
                    try {
                        const response = JSON.parse(this.responseText);
                        
                        const problemData = {
                            Body: response.data.body,
                            constraints: response.data.constraints || "Unknown",
                            hints: response.data.hints || [],
                            editorial_code: response.data.editorial_code || null,
                        };

                        window.dispatchEvent(new CustomEvent("PROBLEM_DATA_FOUND", { 
                            detail: problemData 
                        }));
                    } catch (error) {
                        console.error("Failed to parse problem data:", error);
                    }
                });
            }
            return originalOpen.apply(this, arguments);
        };
    }

    // Start intercepting API calls
    interceptProblemData();
    
    // Announce that the script is loaded
    window.dispatchEvent(new CustomEvent("INJECT_SCRIPT_LOADED1"));
})();