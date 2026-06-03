const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
}

const files = walkSync('./src').filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Background and Cards
  content = content.replace(/bg-black/g, 'bg-[var(--color-theme-from)]');
  content = content.replace(/bg-neutral-900/g, 'bg-[var(--color-theme-panel)]');
  content = content.replace(/border-neutral-800/g, 'border-[var(--color-theme-border)]');
  content = content.replace(/border-neutral-700/g, 'border-[var(--color-theme-border)]');
  
  // Typography
  content = content.replace(/text-white/g, 'text-[var(--color-theme-text)]');
  content = content.replace(/text-neutral-400/g, 'text-[var(--color-theme-muted)]');
  content = content.replace(/text-neutral-300/g, 'text-[var(--color-theme-muted)]');
  
  // Primary Buttons (previously bg-white text-black)
  content = content.replace(/bg-white text-black/g, 'bg-[var(--color-theme-primary)] text-[var(--color-theme-button-text)]');
  content = content.replace(/hover:bg-neutral-200/g, 'hover:opacity-90');
  
  // Focus states
  content = content.replace(/focus:border-white/g, 'focus:border-[var(--color-theme-primary)]');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});
