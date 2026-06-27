import {
  Home,
  Search,
  MapPin,
  FileText,
  Calendar,
  Pill,
  Bell,
  Settings,
  Inbox,
  Users,
  DollarSign,
  Clock,
  LayoutDashboard
} from 'lucide-react';

export const patientLinks = [
  { name: 'Home', path: '/patient/home', icon: Home },
  { name: 'Explore', path: '/patient/explore', icon: Search },
  { name: 'Nearby', path: '/patient/map', icon: MapPin },
  { name: 'Request', path: '/patient/request', icon: FileText },
  { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
  { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
  { name: 'Alerts', path: '/patient/notifications', icon: Bell },
];

export const doctorLinks = [
  { name: 'Home', path: '/doctor/home', icon: Home },
  { name: 'Requests', path: '/doctor/requests', icon: Inbox },
  { name: 'Patients', path: '/doctor/map', icon: Users },
  { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
  { name: 'Earnings', path: '/doctor/earnings', icon: DollarSign },
  { name: 'Availability', path: '/doctor/availability', icon: Clock },
];

export const adminLinks = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Doctors', path: '/admin/doctors', icon: FileText },
  { name: 'Revenue', path: '/admin/revenue', icon: DollarSign },
];

export const getNavLinksByRole = (role) => {
  if (role === 'Patient') return patientLinks;
  if (role === 'Doctor') return doctorLinks;
  if (role === 'Admin') return adminLinks;
  return [];
};
