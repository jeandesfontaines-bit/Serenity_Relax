import re

with open('/Users/jean/Downloads/project/src/components/landing/LandingBookingModal.tsx', 'r') as f:
    content = f.read()

# 1. Inputs style update
input_style_pattern = r'rounded-(full|2xl) border border-\[rgba\(21,32,35,0\.08\)\] bg-\[rgba\(21,32,35,0\.02\)\] (p[xy]-\d+|p-6) text-sm font-medium text-\[var\(--off-black\)\] outline-none transition-all duration-300 hover:border-\[rgba\(21,32,35,0\.15\)\] hover:bg-\[rgba\(21,32,35,0\.04\)\] focus:border-\[var\(--orange\)\] focus:bg-white focus:ring-4 focus:ring-\[rgba\(239,112,63,0\.1\)\] focus:shadow-\[0_4px_20px_-8px_rgba\(239,112,63,0\.2\)\] placeholder:text-\[rgba\(21,32,35,0\.4\)\]'

new_input_style = r'rounded-\1 border border-[rgba(21,32,35,0.08)] bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] \2 text-sm font-medium text-[var(--off-black)] outline-none transition-all duration-300 hover:border-[rgba(21,32,35,0.15)] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.08)] focus:border-[var(--orange)] focus:ring-4 focus:ring-[rgba(239,112,63,0.1)] focus:shadow-[0_4px_20px_-8px_rgba(239,112,63,0.2)] placeholder:text-[rgba(21,32,35,0.3)]'

content = re.sub(input_style_pattern, new_input_style, content)

# 2. Fix the disabled buttons
content = content.replace('disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none', 'disabled:pointer-events-none disabled:from-[#f1f1f1] disabled:to-[#f1f1f1] disabled:text-[#a1a1a1] disabled:shadow-none')

# 3. Fix the select dropdown
select_old = r'''<select
                    className="min-h-16 cursor-pointer appearance-none rounded-full border border-\[rgba\(21,32,35,0\.08\)\] bg-\[rgba\(21,32,35,0\.02\)\] px-6 pr-10 text-sm font-medium text-\[var\(--off-black\)\] outline-none transition-all hover:border-\[rgba\(21,32,35,0\.15\)\] focus:border-\[var\(--orange\)\] focus:bg-white"
                    style=\{\{ backgroundImage: 'url\("data:image/svg\+xml,%3Csvg xmlns=\\\'http://www\.w3\.org/2000/svg\\\' fill=\\\'none\\\' viewBox=\\\'0 0 24 24\\\' stroke=\\\'rgba\(21,32,35,0\.5\)\\\'%3E%3Cpath stroke-linecap=\\\'round\\\' stroke-linejoin=\\\'round\\\' stroke-width=\\\'2\\\' d=\\\'m19 9-7 7-7-7\\\' /%3E%3C/svg%3E"\)' \}\}
                    value=\{bookingData\.phonePrefix\}
                    onChange=\{\(event\) => updateField\('phonePrefix', event\.target\.value as BookingData\['phonePrefix'\]\)\}
                  >'''

select_new = r'''<div className="relative">
                    <select
                      className="min-h-16 w-[120px] cursor-pointer appearance-none rounded-full border border-[rgba(21,32,35,0.08)] bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] pl-6 pr-10 text-sm font-medium text-[var(--off-black)] outline-none transition-all duration-300 hover:border-[rgba(21,32,35,0.15)] hover:shadow-[0_4px_15px_-4px_rgba(0,0,0,0.08)] focus:border-[var(--orange)] focus:ring-4 focus:ring-[rgba(239,112,63,0.1)] focus:shadow-[0_4px_20px_-8px_rgba(239,112,63,0.2)]"
                      value={bookingData.phonePrefix}
                      onChange={(event) => updateField('phonePrefix', event.target.value as BookingData['phonePrefix'])}
                    >'''

content = re.sub(select_old, select_new, content)

content = content.replace('''<option value="BE">BE +32</option>
                  </select>''', '''<option value="BE">BE +32</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[rgba(21,32,35,0.4)]">
                      <ChevronDown size={18} strokeWidth={2.5} />
                    </div>
                  </div>''')


# 4. Import ChevronDown
content = content.replace('ChevronLeft, ChevronRight, X', 'ChevronLeft, ChevronRight, ChevronDown, X')

# 5. Header block styling
header_old = 'className="mb-10 flex flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-[rgba(21,32,35,0.06)] bg-[rgba(21,32,35,0.02)] p-6 sm:flex-row sm:items-center sm:rounded-full sm:p-4 sm:px-8"'
header_new = 'className="mb-10 flex flex-col items-start justify-between gap-4 rounded-[1.5rem] border border-[rgba(21,32,35,0.08)] bg-white/60 backdrop-blur-md shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] p-6 sm:flex-row sm:items-center sm:rounded-full sm:p-4 sm:px-8"'
content = content.replace(header_old, header_new)

# 6. Progress bar spacing
progress_wrapper_old = 'className="mb-10 flex w-full gap-2 px-1"'
progress_wrapper_new = 'className="mb-10 flex w-full gap-1.5 px-1"'
content = content.replace(progress_wrapper_old, progress_wrapper_new)

progress_bar_old = 'h-1.5 flex-1 rounded-full'
progress_bar_new = 'h-1 flex-1 rounded-full'
content = content.replace(progress_bar_old, progress_bar_new)


with open('/Users/jean/Downloads/project/src/components/landing/LandingBookingModal.tsx', 'w') as f:
    f.write(content)

