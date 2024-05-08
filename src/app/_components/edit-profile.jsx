"use client";
import { useUser } from "@clerk/nextjs";

import { dbAssignEducationLevel, getSupabaseTables } from "../../util/requests";

const EditProfile = ({
  educationLevels,
  userRoles,
  userRole,
  supabaseConnection,
}) => {
  const { user: loggedInUser } = useUser();

  const selectedEducationLevelId =
    educationLevels?.filter((el) => el?.users?.length > 0)?.id || "";

  const saveProfile = async (data) => {
    if (!loggedInUser) return;
    await dbAssignEducationLevel(
      supabaseConnection,
      loggedInUser.id,
      data.get("educationLevel").toString(),
    );
    alert("Profile saved");
  };
  return (
    <div>
      <h1 className="prose"> Welcome new {userRole}! </h1>
      <form action={saveProfile}>
        <div className="space-y-12">
          <div className="border-b pb-12">
            <h2 className="text-base font-semibold leading-7">
              This is your profile
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="educationLevel"
                  className="block text-sm font-medium leading-6 "
                >
                  Please select your current Education Level so we can display
                  subjects that are relevant to you.
                </label>
                <div className="mt-2">
                  <select
                    name="educationLevel"
                    defaultValue={selectedEducationLevelId}
                    className="select select-bordered w-full max-w-xs"
                  >
                    <option disabled>Education Level</option>

                    {educationLevels?.length > 0 &&
                      educationLevels.map((el) => (
                        <option key={el?.id} value={el?.id}>
                          {el?.education_level}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="sm:col-span-4">
                <label
                  htmlFor="name surname"
                  className="block text-sm font-medium leading-6 "
                >
                  Name and Surname
                </label>
                <div className="mt-2">
                  <input
                    name="mame"
                    type="text"
                    disabled
                    className="input input-bordered w-1/2 max-w-xs"
                    placeholder="Name"
                    value={loggedInUser?.firstName}
                  />
                  <input
                    name="surname"
                    type="text"
                    disabled
                    className="input input-bordered w-1/2 max-w-xs"
                    placeholder="Surname"
                    value={loggedInUser?.lastName}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button type="button" className="text-sm font-semibold leading-6 ">
            Cancel
          </button>
          <button type="submit" className="btn">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
