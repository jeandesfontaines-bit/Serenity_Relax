import sys
file_path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

# 1. Update main layout margin
for i, line in enumerate(lines):
    if 'selectedAppt || selectedClient' in line:
        lines[i] = line.replace('selectedAppt || selectedClient', 'selectedAppt')

# 2. Fix the slide-over section
start_idx = -1
for i, line in enumerate(lines):
    if 'SLIDE-OVER DETAIL PANEL' in line:
        start_idx = i
        break
end_idx = -1
for i, line in enumerate(lines):
    if 'EVENT MODAL' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    appt_start = -1
    for i in range(start_idx, end_idx):
        if '{selectedAppt && (' in lines[i]:
            appt_start = i
            break
    appt_end = -1
    if appt_start != -1:
        for i in range(appt_start, end_idx):
            if ')}' in lines[i]:
                appt_end = i
                break
    if appt_start != -1 and appt_end != -1:
        new_section = [
            lines[start_idx],
            "        <div className={`fixed inset-y-0 right-0 w-[450px] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.05)] z-40 transform transition-transform duration-500 ease-in-out border-l border-slate-100 flex flex-col ${selectedAppt ? 'translate-x-0' : 'translate-x-full'}`}>\n",
        ]
        new_section += lines[appt_start : appt_end + 1]
        new_section += ["        </div>\n", "      </div>\n\n\n"]
        del lines[start_idx : end_idx]
        lines.insert(start_idx, "".join(new_section))

with open(file_path, 'w') as f:
    f.writelines(lines)
