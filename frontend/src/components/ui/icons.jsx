import { forwardRef } from 'react'
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowLongRightIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  ArrowTrendingUpIcon,
  Bars3BottomLeftIcon,
  Bars3Icon,
  BellAlertIcon,
  BookOpenIcon,
  BookmarkSquareIcon,
  BoltIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon,
  KeyIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PercentBadgeIcon,
  PlayCircleIcon,
  PlusIcon,
  QueueListIcon,
  RadioIcon,
  ShieldCheckIcon,
  SignalIcon,
  Squares2X2Icon,
  TrashIcon,
  TrophyIcon,
  UserIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const toIcon = (Icon) => {
  const WrappedIcon = forwardRef(({ size = 20, className = '', strokeWidth: _strokeWidth, style, ...props }, ref) => (
    <Icon
      ref={ref}
      className={className}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  ))

  WrappedIcon.displayName = Icon.displayName || Icon.name
  return WrappedIcon
}

export const Activity = toIcon(SignalIcon)
export const AlignLeft = toIcon(Bars3BottomLeftIcon)
export const ArrowLeft = toIcon(ArrowLeftIcon)
export const ArrowRight = toIcon(ArrowRightIcon)
export const Award = toIcon(TrophyIcon)
export const BarChart2 = toIcon(ChartBarSquareIcon)
export const Bell = toIcon(BellAlertIcon)
export const BookMarked = toIcon(BookmarkSquareIcon)
export const BookOpen = toIcon(BookOpenIcon)
export const Check = toIcon(CheckIcon)
export const CheckCircle = toIcon(CheckCircleIcon)
export const CheckSquare = toIcon(CheckBadgeIcon)
export const ChevronDown = toIcon(ChevronDownIcon)
export const ChevronLeft = toIcon(ChevronLeftIcon)
export const ChevronRight = toIcon(ChevronRightIcon)
export const Circle = toIcon(RadioIcon)
export const Clock = toIcon(ClockIcon)
export const Download = toIcon(ArrowDownTrayIcon)
export const Edit3 = toIcon(PencilSquareIcon)
export const Eye = toIcon(EyeIcon)
export const EyeOff = toIcon(EyeSlashIcon)
export const FileText = toIcon(DocumentTextIcon)
export const Globe = toIcon(GlobeAltIcon)
export const GraduationCap = toIcon(AcademicCapIcon)
export const Key = toIcon(KeyIcon)
export const LayoutDashboard = toIcon(Squares2X2Icon)
export const List = toIcon(QueueListIcon)
export const Lock = toIcon(LockClosedIcon)
export const LogOut = toIcon(ArrowRightOnRectangleIcon)
export const Mail = toIcon(EnvelopeIcon)
export const Menu = toIcon(Bars3Icon)
export const PencilLine = toIcon(PencilSquareIcon)
export const Percent = toIcon(PercentBadgeIcon)
export const PlayCircle = toIcon(PlayCircleIcon)
export const Plus = toIcon(PlusIcon)
export const RefreshCw = toIcon(ArrowPathIcon)
export const Search = toIcon(MagnifyingGlassIcon)
export const Shield = toIcon(ShieldCheckIcon)
export const Target = toIcon(CursorArrowRaysIcon)
export const Timer = toIcon(ClockIcon)
export const Trash2 = toIcon(TrashIcon)
export const TrendingUp = toIcon(ArrowTrendingUpIcon)
export const User = toIcon(UserIcon)
export const UserCheck = toIcon(UserPlusIcon)
export const UserX = toIcon(UserMinusIcon)
export const Users = toIcon(UsersIcon)
export const X = toIcon(XMarkIcon)
export const XCircle = toIcon(XCircleIcon)
export const Zap = toIcon(BoltIcon)
export const AlertCircle = toIcon(ExclamationCircleIcon)
export const ArrowLongRight = toIcon(ArrowLongRightIcon)
