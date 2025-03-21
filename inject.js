(function() {
    const originalOpen = XMLHttpRequest.prototype.open;
    
    // Function to communicate problem details back to content script
    function dispatchProblemDetails(problemId, details) {
        document.dispatchEvent(new CustomEvent('problemDetailsIntercepted', {
            detail: { problemId, details }
        }));
    }

    XMLHttpRequest.prototype.open = function(method, url, async) {
        // Check if the request URL matches the required endpoint
        if (url.includes("api2.maang.in/problems/user/")) {
            const problemId = url.split("/").pop();
            console.log("🔍 Intercepting Problem Details API:", url);

            this.addEventListener("load", function() {
                if (this.status === 200) {
                    try {
                        const responseData = JSON.parse(this.responseText);
                        console.log(`📌 Problem Details for ID ${problemId}:`, responseData);
                        
                        // Send data to content script
                        dispatchProblemDetails(problemId, responseData);
                        
                        // Store in localStorage only if not already present
                        const storageKey = `problem_${problemId}_details`;
                        if (!localStorage.getItem(storageKey)) {
                            localStorage.setItem(storageKey, JSON.stringify(responseData));
                            console.log(`✅ Problem ${problemId} details saved.`);
                        } else {
                            console.log(`⚡ Problem ${problemId} details already exist.`);
                        }
                    } catch (error) {
                        console.error("❌ Error processing problem details:", error);
                    }
                }
            });
        }

        return originalOpen.apply(this, arguments);
    };
    
    // Function to get user code using the specific key format
    function getUserCode(problemId) {
        // Get current language from localStorage
        const language = localStorage.getItem("editorial-language") || "C++14";
        
        // Build the key using the format you specified
        const codeKey = `course_10672_${problemId}_${language}`;
        
        // Get the code
        const code = localStorage.getItem(codeKey);
        
        // Send back to content script
        document.dispatchEvent(new CustomEvent('userCodeFetched', {
            detail: {
                problemId: problemId,
                language: language,
                code: code || "",
                key: codeKey
            }
        }));
        
        return { code, language, key: codeKey };
    }
    
    // Expose the function to be called from content script
    window.getUserCode = getUserCode;
})();