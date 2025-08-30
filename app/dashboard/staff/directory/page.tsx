import StaffPage from '@/components/data-table/resources/staff.page'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const StaffManagement = () => {
  return (
    <div className="mx-4">
      <div className="flex items-center justify-between my-2">
        {/* <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Staff Management</h1>
          <p className="text-sm text-gray-500">
            Manage your staff and their details.
          </p>
        </div>
        <Button className="bg-black text-white hover:bg-gray-600 p-4 rounded-sm cursor-pointer">
          <Plus className="" />
          Add Staff
        </Button> */}
      </div>
      <StaffPage />
    </div>
  )
}

export default StaffManagement