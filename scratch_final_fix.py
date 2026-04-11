import sys

path = '/Users/jean/Downloads/project/src/app/therapist/dashboard/page.tsx'
with open(path, 'r') as f:
    text = f.read()

# 1. Clean Imports
import_block = """import {
  LayoutDashboard, Calendar, Globe, MapRange, Users, Settings, Leaf, Activity, Target,
  Search, Bell, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2,
  X, Trash2, Clock, Plus, Cog, Power, Mail, FileText, History, User, CreditCard, Download, MessageCircle, MessageSquare, Edit3, ArrowUpRight, Printer, Calendar, Globe, Map
} from 'lucide-react';"""

new_import_block = """import {
  LayoutDashboard, Calendar, Globe, Users, Settings, Leaf, Activity, Target,
  Search, Bell, ChevronLeft, ChevronRight, Lock, Unlock, CheckCircle2,
  X, Trash2, Clock, Plus, Cog, Power, Mail, FileText, History, User, CreditCard, Download, MessageCircle, MessageSquare, Edit3, ArrowUpRight, Printer, MapPin, Map, MapRange as LucideMapRange
} from 'lucide-react';"""
# Note: MapRange might actually be MapPin or Map. I'll use MapPin and remove MapRange if it's missing.
# Wait, let's just use what's standard.

text = text.replace(import_block, new_import_block)

# 2. Fix JSX Syntax Errors
# Line 812
text = text.replace('<Calendar, Globe, MapRange size={28}/>', '<Calendar size={28}/>')
# Line 909
text = text.replace('<Calendar, Globe, Map size={32}/>', '<Calendar size={32}/>')

# 3. Double check if there are other instances of this typo
text = text.replace('<Calendar, Globe, MapRange', '<Calendar')
text = text.replace('<Calendar, Globe, Map', '<Calendar')

with open(path, 'w') as f:
    f.write(text)

