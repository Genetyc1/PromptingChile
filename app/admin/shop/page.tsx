"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, DollarSign, Package, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  status: "active" | "inactive"
  category?: string
  sales_count: number
  created_at: string
  updated_at: string
}

export default function AdminShopPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    currency: "USD",
    status: "active" as "active" | "inactive",
    category: "",
  })

  const userRole = session?.user?.role as string
  const canEdit = ["admin", "owner"].includes(userRole)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/shop/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        console.error("Error loading products:", await response.text())
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description || !newProduct.price) {
      alert("Por favor completa todos los campos obligatorios")
      return
    }

    try {
      const response = await fetch("/api/admin/shop/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProducts([data.product, ...products])
          setNewProduct({
            name: "",
            description: "",
            price: "",
            currency: "USD",
            status: "active",
            category: "",
          })
          setShowAddForm(false)
          alert("Producto creado exitosamente")
        } else {
          alert(data.error || "Error al crear producto")
        }
      } else {
        alert("Error al crear producto")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Error al crear producto")
    }
  }

  const handleEditProduct = async () => {
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/admin/shop/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProduct),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProducts(products.map((p) => (p.id === editingProduct.id ? data.product : p)))
          setEditingProduct(null)
          alert("Producto actualizado exitosamente")
        } else {
          alert(data.error || "Error al actualizar producto")
        }
      } else {
        alert("Error al actualizar producto")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      alert("Error al actualizar producto")
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return

    try {
      const response = await fetch(`/api/admin/shop/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId))
        alert("Producto eliminado exitosamente")
      } else {
        alert("Error al eliminar producto")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error al eliminar producto")
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const totalRevenue = products.reduce((sum, product) => sum + product.price * product.sales_count, 0)
  const totalSales = products.reduce((sum, product) => sum + product.sales_count, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C28840] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tienda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Tienda</h1>
                <p className="text-gray-600">Administra productos y ventas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {canEdit && (
                <Button onClick={() => setShowAddForm(true)} className="bg-[#C28840] hover:bg-[#8B5A2B]">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Productos</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {products.filter((p) => p.status === "active").length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                    <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-[#C28840]">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Nuevo Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Categoría del producto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={newProduct.currency}
                      onValueChange={(value) => setNewProduct({ ...newProduct, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CLP">CLP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={newProduct.status}
                      onValueChange={(value: "active" | "inactive") => setNewProduct({ ...newProduct, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Descripción del producto"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddProduct} className="bg-[#C28840] hover:bg-[#8B5A2B]">
                    Crear Producto
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Product Form */}
          {editingProduct && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Editar Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nombre *</Label>
                    <Input
                      id="edit-name"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Categoría</Label>
                    <Input
                      id="edit-category"
                      value={editingProduct.category || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-price">Precio *</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-currency">Moneda</Label>
                    <Select
                      value={editingProduct.currency}
                      onValueChange={(value) => setEditingProduct({ ...editingProduct, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CLP">CLP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select
                      value={editingProduct.status}
                      onValueChange={(value: "active" | "inactive") =>
                        setEditingProduct({ ...editingProduct, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-description">Descripción *</Label>
                  <Textarea
                    id="edit-description"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleEditProduct} className="bg-[#C28840] hover:bg-[#8B5A2B]">
                    Actualizar Producto
                  </Button>
                  <Button onClick={() => setEditingProduct(null)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 max-w-lg">
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                          {product.category && (
                            <div className="text-xs text-gray-400 mt-1">Categoría: {product.category}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-[#C28840]">
                          {product.currency} ${product.price}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            product.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }
                        >
                          {product.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{product.sales_count}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {product.currency} ${(product.price * product.sales_count).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditingProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
