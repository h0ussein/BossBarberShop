import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { homepageSectionsAPI } from '../../services/api';
import SectionImageUpload from '../../components/SectionImageUpload';
import toast from 'react-hot-toast';

const AdminHomepageSections = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    order: 0,
    isActive: true,
  });
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await homepageSectionsAPI.getAllAdmin();
      setSections(response.data.sections);
    } catch (error) {
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (section = null) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        description: section.description || '',
        order: section.order || 0,
        isActive: section.isActive,
      });
      setImageData(null);
    } else {
      setEditingSection(null);
      setFormData({
        description: '',
        order: sections.length,
        isActive: true,
      });
      setImageData(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setFormData({
      description: '',
      order: 0,
      isActive: true,
    });
    setImageData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingSection && !imageData) {
      toast.error('Please upload an image');
      return;
    }

    try {
      const data = {
        ...formData,
        image: editingSection && !imageData 
          ? editingSection.image 
          : imageData,
      };

      if (editingSection) {
        await homepageSectionsAPI.update(editingSection._id, data);
        toast.success('Section updated successfully');
      } else {
        await homepageSectionsAPI.create(data);
        toast.success('Section created successfully');
      }

      handleCloseModal();
      fetchSections();
    } catch (error) {
      toast.error(error.message || 'Failed to save section');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section? The image will be permanently deleted.')) {
      return;
    }

    try {
      await homepageSectionsAPI.delete(id);
      toast.success('Section deleted successfully');
      fetchSections();
    } catch (error) {
      toast.error(error.message || 'Failed to delete section');
    }
  };

  const handleToggleActive = async (section) => {
    try {
      await homepageSectionsAPI.update(section._id, {
        isActive: !section.isActive,
      });
      toast.success(`Section ${!section.isActive ? 'activated' : 'deactivated'}`);
      fetchSections();
    } catch (error) {
      toast.error('Failed to update section');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Homepage Sections</h1>
          <p className="mt-1 text-sm text-white/60">
            Manage image sections that appear on the homepage
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-white/80"
        >
          + Add Section
        </button>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-white/60">No sections yet. Add your first section!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section._id}
              className={`rounded-2xl border p-4 transition ${
                section.isActive
                  ? 'border-white/10 bg-white/5'
                  : 'border-white/5 bg-white/5 opacity-60'
              }`}
            >
              <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-white/5">
                <img
                  src={section.image.url}
                  alt={section.description || 'Homepage section'}
                  className="h-full w-full object-cover"
                />
                {!section.isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-sm font-semibold text-white">Inactive</span>
                  </div>
                )}
              </div>
              
              {section.description && (
                <p className="mb-3 line-clamp-2 text-sm text-white/70">
                  {section.description}
                </p>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">Order: {section.order}</span>
                <div className="flex-1"></div>
                <button
                  onClick={() => handleToggleActive(section)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                    section.isActive
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-white/10 text-white/50 hover:bg-white/20'
                  }`}
                >
                  {section.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleOpenModal(section)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(section._id)}
                  className="flex-1 rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Image {!editingSection && '*'}
                </label>
                <SectionImageUpload
                  currentImage={editingSection?.image?.url}
                  onUploadSuccess={(result) => {
                    setImageData({
                      url: result.url,
                      fileId: result.fileId,
                    });
                  }}
                  folder="homepage-sections"
                  tokenType="admin"
                />
                {!imageData && !editingSection && (
                  <p className="mt-1 text-xs text-red-500">Image is required</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="4"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/30"
                  placeholder="Enter section description..."
                />
              </div>

              {/* Order */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/30"
                />
                <p className="mt-1 text-xs text-white/50">
                  Lower numbers appear first. Sections are sorted by order, then by creation date.
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-white/20 text-white focus:ring-white"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-white">
                  Active (visible on homepage)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/80"
                >
                  {editingSection ? 'Update' : 'Create'} Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default AdminHomepageSections;
