import { KodraBackup } from '../types';

/**
 * Generates a human-readable Markdown report with an embedded system payload
 * for 100% accurate restoration.
 */
export const exportToMarkdown = (backup: KodraBackup): string => {
  const { meta, data, settings } = backup;
  
  // 1. Human Readable Header
  let md = `# 🛡️ Kodra System Backup Report
**Version:** ${meta.version}
**Date:** ${new Date(meta.timestamp).toLocaleString()}
**Exported By:** ${meta.exportedBy}
**Theme:** ${settings.theme} | **Font:** ${settings.font}
`;

  // 2. Clients Section
  if (data.clients !== undefined) {
    md += `\n---\n\n## 👥 Client Database (${data.clients.length})\n\n`;
    if (data.clients.length === 0) {
      md += `*No clients found.*\n`;
    } else {
      data.clients.forEach(c => {
        md += `### 👤 ${c.name}\n`;
        if (c.industry) md += `- **Industry:** ${c.industry}\n`;
        if (c.contactPerson) md += `- **Contact:** ${c.contactPerson}\n`;
        if (c.email) md += `- **Email:** ${c.email}\n`;
        if (c.notes) md += `- **Notes:** ${c.notes}\n`;
        md += `\n`;
      });
    }
  }

  // 3. Projects Section
  if (data.projects !== undefined) {
    md += `\n---\n\n## 📂 Project Archive (${data.projects.length})\n\n`;
    if (data.projects.length === 0) {
      md += `*No projects found.*\n`;
    } else {
      data.projects.forEach(p => {
        const clientName = (data.clients || []).find(c => c.id === p.clientId)?.name || "General";
        md += `### 📁 ${p.name}\n`;
        md += `- **Date:** ${new Date(p.date).toLocaleDateString()}\n`;
        md += `- **Client:** ${clientName}\n`;
        md += `- **Model:** ${p.selectedModel || 'N/A'}\n`;
        md += `- **Brief Summary:** ${p.briefText.substring(0, 100).replace(/\n/g, ' ')}...\n`;
        
        if (p.strategy) {
          md += `- **Strategy Core:** ${p.strategy.coreMessage}\n`;
        }
        md += `\n`;
      });
    }
  }

  // 4. RESTORATION PAYLOAD (The Magic Part)
  // We embed the raw JSON in a specific code block that our parser looks for.
  md += `
---

### ⚠ SYSTEM RESTORE DATA
*Do not edit the block below if you intend to restore from this file.*

\`\`\`kodra-restore-payload
${JSON.stringify(backup)}
\`\`\`
`;

  return md;
};

/**
 * Parses either a raw JSON string or a Markdown file containing the payload.
 */
export const parseBackupFile = (content: string): KodraBackup => {
  const trimmed = content.trim();

  // A. Try parsing as standard JSON
  if (trimmed.startsWith('{')) {
    try {
      return JSON.parse(trimmed);
    } catch (e) {
      // Fall through to Markdown check
    }
  }

  // B. Try parsing as Markdown with embedded payload
  const payloadMarker = "```kodra-restore-payload";
  const startIndex = content.indexOf(payloadMarker);
  
  if (startIndex !== -1) {
    const payloadStart = startIndex + payloadMarker.length;
    const endIndex = content.indexOf("```", payloadStart);
    
    if (endIndex !== -1) {
      const jsonString = content.substring(payloadStart, endIndex).trim();
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        throw new Error("Found payload block but failed to parse JSON inside it.");
      }
    }
  }

  throw new Error("Invalid file format. Could not find Kodra backup data.");
};