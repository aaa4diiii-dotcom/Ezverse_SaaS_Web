for (const item of $input.all()) {
    if (item.json && item.json.text) {
        let rawText = item.json.text;

        // 1. Strip away any accidental markdown code block ticks if Gemini adds them
        if (rawText.includes('```')) {
            rawText = rawText.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '');
        }
        rawText = rawText.trim();

        try {
            // 2. Parse the string into a real JavaScript object
            const parsedData = JSON.parse(rawText);
            
            // 3. Re-build a beautiful, highly-readable text string for the UI panel
            let displayOutput = "";
            
            if (parsedData.document_title) {
                displayOutput += `DOCUMENT TITLE:\n${parsedData.document_title}\n\n`;
            }
            
            if (parsedData.summary) {
                displayOutput += `SUMMARY:\n${parsedData.summary}\n\n`;
            }
            
            if (Array.isArray(parsedData.technical_findings) && parsedData.technical_findings.length > 0) {
                displayOutput += `TECHNICAL FINDINGS:\n`;
                parsedData.technical_findings.forEach(point => {
                    displayOutput += `• ${point}\n`;
                });
                displayOutput += `\n`;
            }
            
            if (Array.isArray(parsedData.ethical_findings) && parsedData.ethical_findings.length > 0) {
                displayOutput += `ETHICAL FINDINGS:\n`;
                parsedData.ethical_findings.forEach(point => {
                    displayOutput += `• ${point}\n`;
                });
                displayOutput += `\n`;
            }
            
            if (parsedData.conclusion) {
                displayOutput += `CONCLUSION:\n${parsedData.conclusion}`;
            }

            // 4. Send the clean formatting to your Lovable frontend keys
            item.json.success = true;
            item.json.cleaned_output = displayOutput.trim();
            item.json.data = parsedData; // Keeps raw JSON structured if your UI needs it later
            item.json.is_structured = true;

        } catch (e) {
            // Fallback: If it's not valid JSON, clean it as plain text
            let plainText = rawText
                .replace(/\\"/g, '"')
                .replace(/[\{\}\[\]"']/g, '')
                .trim();
                
            item.json.success = true;
            item.json.cleaned_output = plainText;
            item.json.data = plainText;
            item.json.is_structured = false;
        }
    } else {
        item.json.success = false;
        item.json.error = "No valid data received from the LLM.";
    }
}

return $input.all();