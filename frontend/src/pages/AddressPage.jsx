import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { fetchAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "../store/slices/addressSlice.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import { Plus, MapPin, Edit2, Trash2, CheckCircle2 } from "lucide-react";

const AddressPage = () => {
  const dispatch = useDispatch();
  const { addresses, isLoading } = useSelector((state) => state.address);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleOpenForm = (address = null) => {
    if (address) {
      setEditingAddressId(address.id);
      reset({
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || "",
        landmark: address.landmark || "",
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        type: address.type,
      });
    } else {
      setEditingAddressId(null);
      reset({
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        landmark: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        type: "HOME",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddressId(null);
  };

  const onSubmit = async (data) => {
    if (editingAddressId) {
      await dispatch(updateAddress({ id: editingAddressId, data }));
    } else {
      await dispatch(createAddress(data));
    }
    handleCloseForm();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      dispatch(deleteAddress(id));
    }
  };

  const handleSetDefault = (id) => {
    dispatch(setDefaultAddress(id));
  };

  if (isLoading && addresses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
        {!isFormOpen && (
          <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
            <Plus size={18} /> Add New Address
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editingAddressId ? "Edit Address" : "Add New Address"}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" {...register("fullName", { required: "Name is required" })} error={errors.fullName?.message} />
            <Input label="Phone Number" {...register("phone", { required: "Phone is required", pattern: { value: /^[0-9]{10,15}$/, message: "Invalid phone number" } })} error={errors.phone?.message} />
            <div className="md:col-span-2">
              <Input label="Address Line 1" {...register("addressLine1", { required: "Address Line 1 is required" })} error={errors.addressLine1?.message} />
            </div>
            <Input label="Address Line 2 (Optional)" {...register("addressLine2")} />
            <Input label="Landmark (Optional)" {...register("landmark")} />
            <Input label="City" {...register("city", { required: "City is required" })} error={errors.city?.message} />
            <Input label="State" {...register("state", { required: "State is required" })} error={errors.state?.message} />
            <Input label="Postal Code" {...register("postalCode", { required: "Postal Code is required", pattern: { value: /^[1-9][0-9]{5}$/, message: "Invalid PIN Code" } })} error={errors.postalCode?.message} />
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <select {...register("country")} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-500">
                <option value="India">India</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2 mt-2">
              <label className="block text-sm font-medium text-gray-700">Address Type</label>
              <div className="flex gap-4 mt-2">
                {["HOME", "WORK", "OTHER"].map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={type} {...register("type")} className="text-brand-600 focus:ring-brand-500" />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex gap-3 justify-end mt-4">
              <Button type="button" variant="secondary" onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit" isLoading={isSubmitting}>Save Address</Button>
            </div>
          </form>
        </div>
      )}

      {!isFormOpen && addresses.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-brand-50 p-4 rounded-full mb-4 text-brand-600">
            <MapPin size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No saved addresses</h3>
          <p className="text-gray-500 mb-6">Add an address so we can deliver your orders quickly.</p>
          <Button onClick={() => handleOpenForm()}>Add New Address</Button>
        </div>
      )}

      {!isFormOpen && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className={`bg-white rounded-xl shadow-sm border ${address.isDefault ? 'border-brand-500 bg-brand-50/10' : 'border-gray-200'} p-5 relative`}>
              {address.isDefault && (
                <span className="absolute top-4 right-4 bg-brand-100 text-brand-700 text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                  <CheckCircle2 size={12} /> Default
                </span>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">{address.type}</span>
              </div>
              
              <h3 className="text-base font-bold text-gray-900 mb-1">{address.fullName}</h3>
              <p className="text-sm text-gray-600 mb-3">{address.phone}</p>
              
              <div className="text-sm text-gray-600 mb-5">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                {address.landmark && <p>Landmark: {address.landmark}</p>}
                <p>{address.city}, {address.state} - {address.postalCode}</p>
                <p>{address.country}</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {!address.isDefault && (
                  <button onClick={() => handleSetDefault(address.id)} className="text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors">
                    Set as Default
                  </button>
                )}
                {!address.isDefault && <span className="text-gray-300">|</span>}
                <button onClick={() => handleOpenForm(address)} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <Edit2 size={14} /> Edit
                </button>
                <span className="text-gray-300">|</span>
                <button onClick={() => handleDelete(address.id)} className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressPage;
