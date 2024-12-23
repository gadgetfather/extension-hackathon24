(function () {
  // Timeout to wait for potential dynamically loaded content
  setTimeout(() => {
    const pageTitle = document.title;

    // Get all paragraph elements and filter out empty or whitespace-only text
    const paragraphs = Array.from(document.querySelectorAll(".a3s.aiL"))
      .map((p) => p.textContent.trim()) // Trim the text content
      .filter((text) => text.length > 0); // Exclude empty or whitespace-only paragraphs

    // Combine the scraped data
    const scrapedData = {
      title: pageTitle,
      paragraphs: paragraphs,
    };

    // Send the scraped data to the popup
    chrome.runtime.sendMessage({ data: scrapedData });
  }, 2000); // Wait 2 seconds for dynamic content to load
})();
