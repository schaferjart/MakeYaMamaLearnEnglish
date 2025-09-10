from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/")

    # Click the "Gespräche" button
    page.get_by_role("button", name="Gespräche").click()

    # Check if conversations are present
    conversation_list = page.locator(".space-y-2.max-h-64.overflow-y-auto")

    if conversation_list.count() > 0:
        # Find a paragraph and select text
        messages_container = conversation_list.first

        # Focus on the container to enable text selection
        messages_container.focus()

        # Select text using mouse actions
        bounding_box = messages_container.bounding_box()
        if bounding_box:
            page.mouse.move(bounding_box['x'] + 20, bounding_box['y'] + 20)
            page.mouse.down()
            page.mouse.move(bounding_box['x'] + 100, bounding_box['y'] + 20)
            page.mouse.up()

        # Wait for the vocabulary panel to appear
        vocabulary_panel = page.locator(".w-96.max-w-\\[90vw\\].shadow-\\[var\\(--shadow-vocabulary\\)\\]")
        expect(vocabulary_panel).to_be_visible(timeout=10000)
    else:
        # If no conversations, expect the empty state message
        expect(page.get_by_text("Noch keine Gespräche")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
