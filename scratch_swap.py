import sys
import re

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Swap the two blocks in DashboardOverview
block1_start = text.find('              {/* Simple Activity Chart (Visual only for Wow factor) */}')
block1_end = text.find('              <div className="space-y-8">', block1_start)

block2_start = block1_end
block2_end = text.find('            </div>\n\n            {/* Right Column', block2_start)

if block1_start != -1 and block2_start != -1 and block2_end != -1:
    block1 = text[block1_start:block1_end]
    block2 = text[block2_start:block2_end]
    
    # We reconstruct that portion of the file:
    text = text[:block1_start] + block2 + '\n' + block1 + text[block2_end:]

# 2. Rename 'Stats' to 'Home' in the sidebar
text = text.replace("{ id: 'dashboard',  Icon: LayoutDashboard, label: 'Stats' }", "{ id: 'dashboard',  Icon: LayoutDashboard, label: 'Home' }")

# Just to be safe if there's any header in DashboardOverview that says "Stats", let's check
# DashboardOverview header is usually defined somewhere around line 800-840:
# <h2 className="text-4xl font-black text-slate-900 uppercase tracking-normal">...
# Wait, let's just make the simple replace first.

with open(path, 'w') as f:
    f.write(text)

