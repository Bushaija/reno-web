
import ChangeRequestsPage from '@/components/data-table/resources/change-request.page'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const ChangeRequests = () => {
  return (
    <div className="mx-4">
      <div className="flex items-center justify-between my-2">
        {/* <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Change Requests</h1>
          <p className="text-sm text-gray-500">
            Manage your change requests.
          </p>
        </div> */}
        {/* <Button className="bg-black text-white hover:bg-gray-600 p-4 rounded-sm cursor-pointer">
          <Plus className="" />
          Add Change Request
        </Button> */}
      </div>
      <ChangeRequestsPage />
    </div>
  )
}

export default ChangeRequests