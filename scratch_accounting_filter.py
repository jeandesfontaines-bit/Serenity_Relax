import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Update Navigation condition to show arrows in Accounting tab
old_nav_cond = "{tab === 'scheduler' && ("
new_nav_cond = "{(tab === 'scheduler' || tab === 'accounting') && ("
# Note: Be careful with multiple occurrences if any.

text = text.replace(old_nav_cond, new_nav_cond)

# 2. Update filtering logic in AccountingView
old_filter = """    const filteredAppts = appointments.filter(a => {
      const matchSearch = (a.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const status = a.paid ? 'paid' : 'pending';
      const matchStatus = filterStatus === 'all' || status === filterStatus;
      return matchSearch && matchStatus;
    }).sort((a,b) => (b.date || '').localeCompare(a.date || ''));"""

new_filter = """    const filteredAppts = appointments.filter(a => {
      const matchSearch = (a.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const status = a.paid ? 'paid' : 'pending';
      const matchStatus = filterStatus === 'all' || status === filterStatus;
      
      // Filtre par mois (basé sur le navigateur en haut)
      try {
        const apptDate = parse(a.date, 'yyyy-MM-dd', new Date());
        const matchMonth = isSameMonth(apptDate, cur) && isSameYear(apptDate, cur);
        return matchSearch && matchStatus && matchMonth;
      } catch(e) { return false; }
    }).sort((a,b) => (b.date || '').localeCompare(a.date || ''));"""

text = text.replace(old_filter, new_filter)

with open(path, 'w') as f:
    f.write(text)

