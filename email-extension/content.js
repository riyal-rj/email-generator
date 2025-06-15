console.log("Email Writer Extension - Content Script Loaded");

function createAIButton() {
  const button = document.createElement('div');
  button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
  button.style.marginRight = '8px';
  button.style.cursor = 'pointer';
  button.innerHTML = 'AI Reply';
  button.setAttribute('role', 'button');
  button.setAttribute('data-tooltip', 'Generate AI Reply');
  return button;
}

function getEmailContent() {
  // Updated selectors for Gmail's current structure
  const selectors = [
    '.ii.gt .a3s.aiL',
    '.h7',
    '.a3s.aiL',
    '.gmail_quote',
    '[role="presentation"]',
    '.Am.Al.editable'
  ];
  
  for (const selector of selectors) {
    const content = document.querySelector(selector);
    if (content && content.innerText) {
      return content.innerText.trim();
    }
  }
  return '';
}

function findComposeToolbar() {
  // Updated selectors for current Gmail compose window
  const selectors = [
    '.btC',
    '.aDh',
    '[role="toolbar"]',
    '.gU.Up',
    '.An.ar.As',
    '.aYF'
  ];
  
  for (const selector of selectors) {
    const toolbar = document.querySelector(selector);
    if (toolbar) {
      return toolbar;
    }
  }
  return null;
}

function findComposeBox() {
  // Multiple selectors to find the compose text area
  const selectors = [
    '[role="textbox"][g_editable="true"]',
    '[role="textbox"][contenteditable="true"]',
    '.Am.Al.editable',
    '.editable',
    'div[role="textbox"]'
  ];
  
  for (const selector of selectors) {
    const box = document.querySelector(selector);
    if (box) {
      return box;
    }
  }
  return null;
}

function insertTextIntoComposeBox(text) {
  const composeBox = findComposeBox();
  
  if (composeBox) {
    // Try multiple methods to insert text
    composeBox.focus();
    
    // Method 1: Try execCommand (older browsers)
    if (document.execCommand) {
      try {
        document.execCommand('insertText', false, text);
        return true;
      } catch (e) {
        console.log('execCommand failed, trying alternative method');
      }
    }
    
    // Method 2: Direct innerHTML/textContent
    if (composeBox.innerHTML !== undefined) {
      composeBox.innerHTML = text;
      return true;
    }
    
    // Method 3: Set textContent
    composeBox.textContent = text;
    
    // Trigger input event to notify Gmail
    const event = new Event('input', { bubbles: true });
    composeBox.dispatchEvent(event);
    
    return true;
  }
  
  return false;
}

function injectButton() {
  // Remove existing button if present
  const existingButton = document.querySelector('.ai-reply-button');
  if (existingButton) {
    existingButton.remove();
  }

  const toolbar = findComposeToolbar();
  if (!toolbar) {
    console.log("Toolbar not found");
    return;
  }

  console.log("Toolbar found, creating AI button");
  const button = createAIButton();
  button.classList.add('ai-reply-button');

  button.addEventListener('click', async () => {
    try {
      button.innerHTML = 'Generating...';
      button.style.pointerEvents = 'none';

      const emailContent = getEmailContent();
      console.log('Email content extracted:', emailContent.substring(0, 100) + '...');

      const response = await fetch('http://localhost:8080/api/v1/email/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          emailContent: emailContent,
          tone: "professional"
        })
      });

      if (!response.ok) {
        throw new Error(`API Request Failed: ${response.status} ${response.statusText}`);
      }

      const generatedReply = await response.text();
      console.log('Generated reply:', generatedReply.substring(0, 100) + '...');

      const inserted = insertTextIntoComposeBox(generatedReply);
      
      if (!inserted) {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(generatedReply).then(() => {
          alert('Reply generated and copied to clipboard! Please paste it manually.');
        }).catch(() => {
          alert('Reply generated but could not insert automatically. Please check console for the reply.');
          console.log('Generated reply:', generatedReply);
        });
      }

    } catch (error) {
      console.error('Error generating reply:', error);
      alert(`Failed to generate reply: ${error.message}`);
    } finally {
      button.innerHTML = 'AI Reply';
      button.style.pointerEvents = 'auto';
    }
  });

  // Insert button at the beginning of toolbar
  toolbar.insertBefore(button, toolbar.firstChild);
}

// Wait for page to load completely
function waitForGmail() {
  if (window.location.hostname === 'mail.google.com') {
    console.log('Gmail detected, setting up extension');
    
    // Initial injection attempt
    setTimeout(() => {
      injectButton();
    }, 2000);
    
    // Set up observer for dynamic content
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
          node.nodeType === Node.ELEMENT_NODE && 
          (node.matches && (
            node.matches('.aDh, .btC, [role="dialog"], .nH.if, .SK.AX') || 
            node.querySelector('.aDh, .btC, [role="dialog"], .nH.if, .SK.AX')
          ))
        );

        if (hasComposeElements) {
          console.log("Compose Window Detected");
          setTimeout(injectButton, 1000);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForGmail);
} else {
  waitForGmail();
}