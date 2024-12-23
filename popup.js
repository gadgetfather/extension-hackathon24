document.getElementById("scrapeButton").addEventListener("click", () => {
  // Get the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0].id;

    // Inject and execute content script in the active tab to scrape data
    chrome.scripting.executeScript({
      target: { tabId: activeTab },
      files: ["content.js"],
    });
  });
});

// Listen for the scraped data and display it
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.data) {
    const scrapedData = message.data;

    // Display the raw scraped data
    document.getElementById("data").textContent = JSON.stringify(
      scrapedData,
      null,
      2
    );

    // Make an API call to OpenAI for the summary
    const summary = await generateSummary(scrapedData.paragraphs);
    document.getElementById("summary").textContent = summary;

    // Show "Add to Timesheet" button
    document.getElementById("timesheetDiv").classList.remove("hidden");
  }
});

// Function to call OpenAI API for summary generation
async function generateSummary(paragraphs) {
  const apiKey = "OPEN_AI_KEY"; // Replace with your OpenAI API key
  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant that summarizes text into 3 concise bullet points."
    },
    {
      role: "user",
      content: `Summarize the following text into 3 bullet points:\n\n${paragraphs.join("\n\n")}`
    }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18", // Use your preferred model
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    // Ensure the response is OK
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Validate and return the response
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      throw new Error("Unexpected API response structure: 'choices' is undefined or empty.");
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    return "An error occurred while generating the summary.";
  }
}

// Handle "Add to Timesheet" button click
document.getElementById("addToTimesheetButton").addEventListener("click", () => {
  const summary = document.getElementById("summary").textContent;
  if (summary && summary !== "Summary will appear here.") {
    alert(`Added to Timesheet: \n${summary}`);
    // Add logic to send the summary to a timesheet API or local storage if needed
  } else {
    alert("No summary available to add.");
  }
});
