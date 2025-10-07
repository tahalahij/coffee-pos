'use client'

import { useState, useEffect } from 'react'
import { Plus, Minus, ShoppingCart, Printer, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Product, Category } from '@/types'
import { CheckoutModal } from './checkout-modal'
import { useCartStore } from '@/hooks/use-cart-store'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export function POSInterface() {
	const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
	const [categories, setCategories] = useState<Category[]>([])
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const { items, addItem, updateQuantity, getTotalAmount, clearCart } =
		useCartStore()

	// Fetch categories and products from API
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true)

				// Fetch categories
				const categoriesResponse = await api.get('/categories')
				const fetchedCategories = categoriesResponse.data
				setCategories(fetchedCategories)

				// Set first category as selected by default
				if (fetchedCategories.length > 0) {
					setSelectedCategory(fetchedCategories[0].id)
				}

				// Fetch products
				const productsResponse = await api.get('/products')
				setProducts(productsResponse.data)

			} catch (error) {
				console.error('Error fetching data:', error)
				toast.error('Failed to load products and categories')
			} finally {
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	const filteredProducts = products.filter(
		(product) =>
			(selectedCategory === null || product.categoryId === selectedCategory) && product.isAvailable
	)

	const handleAddToCart = (product: Product) => {
		addItem(product)
	}

	const handleCheckout = () => {
		setIsCheckoutOpen(true)
	}

	const handleCheckoutComplete = () => {
		clearCart()
		setIsCheckoutOpen(false)
	}

	if (loading) {
		return (
			<div className="flex h-full bg-gray-50 items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-500">Loading products...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="flex h-full bg-gray-50">
			{/* Product Selection Area */}
			<div className="flex-1 flex flex-col p-6">
				{/* Category Tabs */}
				<div className="flex space-x-2 mb-6">
					<Button
						variant={selectedCategory === null ? 'default' : 'outline'}
						onClick={() => setSelectedCategory(null)}
						className="px-6 py-2"
					>
						All
					</Button>
					{categories.map((category) => (
						<Button
							key={category.id}
							variant={
								selectedCategory === category.id ? 'default' : 'outline'
							}
							onClick={() => setSelectedCategory(category.id)}
							className="px-6 py-2"
						>
							{category.name}
						</Button>
					))}
				</div>

				{/* Product Grid */}
				<div className="flex-1 overflow-auto">
					{filteredProducts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-gray-500">
								{selectedCategory !== null ? 'No products available in this category' : 'No products available'}
							</p>
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{filteredProducts.map((product) => (
								<Card
									key={product.id}
									className="cursor-pointer hover:shadow-md transition-shadow"
									onClick={() => handleAddToCart(product)}
								>
									<CardContent className="p-4">
										<div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
											{product.imageUrl ? (
												<img
													src={product.imageUrl}
													alt={product.name}
													className="w-full h-full object-cover rounded-lg"
												/>
											) : (
												<span className="text-gray-400 text-2xl">📷</span>
											)}
										</div>
										<h3 className="font-medium text-gray-900 mb-1">
											{product.name}
										</h3>
										<p className="text-sm text-gray-500 mb-2">
											{product.description}
										</p>
										<div className="flex items-center justify-between">
											<span className="text-lg font-bold text-blue-600">
												{formatCurrency(product.price)}
											</span>
											<div className="flex items-center space-x-2">
												{product.stock !== undefined && (
													<span className="text-xs text-gray-400">
														Stock: {product.stock}
													</span>
												)}
												<Plus className="h-5 w-5 text-gray-400" />
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Cart Sidebar */}
			<div className="w-96 bg-white border-l border-gray-200 flex flex-col">
				<div className="p-6 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold text-gray-900 flex items-center">
							<ShoppingCart className="h-5 w-5 mr-2" />
							Current Order
						</h2>
						<span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
							{items.length} items
						</span>
					</div>
				</div>

				{/* Cart Items */}
				<div className="flex-1 overflow-auto p-6">
					{items.length === 0 ? (
						<div className="text-center py-12">
							<ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
							<p className="text-gray-500">No items in cart</p>
						</div>
					) : (
						<div className="space-y-4">
							{items.map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
								>
									<div className="flex-1">
										<h4 className="font-medium text-gray-900">
											{item.product.name}
										</h4>
										<p className="text-sm text-gray-500">
											{formatCurrency(item.price)} each
										</p>
									</div>
									<div className="flex items-center space-x-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												updateQuantity(
													item.id,
													Math.max(0, item.quantity - 1)
												)
											}
										>
											<Minus className="h-3 w-3" />
										</Button>
										<span className="w-8 text-center font-medium">
											{item.quantity}
										</span>
										<Button
											size="sm"
											variant="outline"
											onClick={() =>
												updateQuantity(item.id, item.quantity + 1)
											}
										>
											<Plus className="h-3 w-3" />
										</Button>
									</div>
									<div className="ml-4 text-right">
										<p className="font-medium text-gray-900">
											{formatCurrency(item.price * item.quantity)}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Cart Total & Checkout */}
				{items.length > 0 && (
					<div className="p-6 border-t border-gray-200 bg-gray-50">
						<div className="space-y-2 mb-4">
							<div className="flex justify-between">
								<span>Subtotal:</span>
								<span>{formatCurrency(getTotalAmount())}</span>
							</div>
							<div className="flex justify-between">
								<span>Tax (8%):</span>
								<span>{formatCurrency(getTotalAmount() * 0.08)}</span>
							</div>
							<div className="flex justify-between font-bold text-lg border-t pt-2">
								<span>Total:</span>
								<span>{formatCurrency(getTotalAmount() * 1.08)}</span>
							</div>
						</div>

						<div className="space-y-2">
							<Button
								onClick={handleCheckout}
								className="w-full"
								size="lg"
							>
								<CreditCard className="h-4 w-4 mr-2" />
								Checkout
							</Button>
							<Button
								variant="outline"
								className="w-full"
								size="lg"
							>
								<Printer className="h-4 w-4 mr-2" />
								Print Receipt
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* Checkout Modal */}
			{isCheckoutOpen && (
				<CheckoutModal
					isOpen={isCheckoutOpen}
					onClose={() => setIsCheckoutOpen(false)}
					onComplete={handleCheckoutComplete}
					total={getTotalAmount() * 1.08}
					items={items}
				/>
			)}
		</div>
	)
}
