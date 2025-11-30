"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import { useNotification } from "@/lib/context/notification-context"
import { PageLayout } from "@/components/layout/page-layout"
import { AirbnbCard } from "@/components/ui/airbnb-card"
import { AirbnbButton } from "@/components/ui/airbnb-button"
import { AirbnbInput } from "@/components/ui/airbnb-input"
import { Plus, Edit, Trash2, User } from "lucide-react"
import type { Child } from "@/firebase/children"

export default function ChildrenPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { showToast } = useNotification()
  const router = useRouter()
  
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    gradeLevel: "",
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "parent")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadChildren()
    }
  }, [user])

  const loadChildren = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const { getChildrenByParentId } = await import("@/firebase/children")
      const childrenData = await getChildrenByParentId(user.id)
      setChildren(childrenData)
    } catch (error) {
      console.error('Error loading children:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load children",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      gender: "",
      gradeLevel: "",
    })
    setEditingChild(null)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.name || !formData.age || !formData.gender || !formData.gradeLevel) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all fields",
      })
      return
    }

    setIsSaving(true)

    try {
      const { addChild, updateChild } = await import("@/firebase/children")

      const childData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        gradeLevel: formData.gradeLevel,
        parentId: user.id,
        parentEmail: user.email,
        createdAt: new Date().toISOString(),
      }

      if (editingChild) {
        // Update existing child
        await updateChild(editingChild.id!, {
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          gradeLevel: formData.gradeLevel,
        })
        
        showToast({
          type: "success",
          title: "Child Updated",
          message: `${formData.name}'s information has been updated`,
        })
      } else {
        // Add new child
        await addChild(childData)
        
        showToast({
          type: "success",
          title: "Child Registered",
          message: `${formData.name} has been registered successfully`,
        })
      }

      resetForm()
      loadChildren()
    } catch (error) {
      console.error('Error saving child:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to save child information",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setFormData({
      name: child.name,
      age: child.age.toString(),
      gender: child.gender,
      gradeLevel: child.gradeLevel,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (child: Child) => {
    if (!confirm(`Are you sure you want to remove ${child.name}?`)) return

    try {
      const { deleteChild } = await import("@/firebase/children")
      await deleteChild(child.id!)
      
      showToast({
        type: "success",
        title: "Child Removed",
        message: `${child.name} has been removed`,
      })
      
      loadChildren()
    } catch (error) {
      console.error('Error deleting child:', error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to remove child",
      })
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Children</h1>
            <p className="text-muted-foreground mt-1">
              Manage your children's profiles
            </p>
          </div>
          {!showAddForm && (
            <AirbnbButton
              onClick={() => setShowAddForm(true)}
              leftIcon={<Plus className="h-5 w-5" />}
            >
              Add Child
            </AirbnbButton>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <AirbnbCard className="mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingChild ? "Edit Child" : "Register New Child"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AirbnbInput
                label="Full Name"
                placeholder="Enter child's full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AirbnbInput
                  label="Age"
                  type="number"
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  min="1"
                  max="18"
                  required
                />

                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Grade Level</label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select grade level</option>
                  <option value="Preschool">Preschool</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end">
                <AirbnbButton
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </AirbnbButton>
                <AirbnbButton type="submit" isLoading={isSaving}>
                  {editingChild ? "Update Child" : "Register Child"}
                </AirbnbButton>
              </div>
            </form>
          </AirbnbCard>
        )}

        {/* Children List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : children.length === 0 ? (
          <AirbnbCard className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Children Registered</h3>
            <p className="text-muted-foreground mb-4">
              Register your first child to start booking tutoring sessions
            </p>
            {!showAddForm && (
              <AirbnbButton
                onClick={() => setShowAddForm(true)}
                leftIcon={<Plus className="h-5 w-5" />}
              >
                Add Child
              </AirbnbButton>
            )}
          </AirbnbCard>
        ) : (
          <div className="grid gap-4">
            {children.map((child) => (
              <AirbnbCard key={child.id} hoverable>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{child.name}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                        <span>Age: {child.age}</span>
                        <span>•</span>
                        <span>{child.gender}</span>
                        <span>•</span>
                        <span>{child.gradeLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AirbnbButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(child)}
                      leftIcon={<Edit className="h-4 w-4" />}
                    >
                      Edit
                    </AirbnbButton>
                    <AirbnbButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(child)}
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Remove
                    </AirbnbButton>
                  </div>
                </div>
              </AirbnbCard>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
