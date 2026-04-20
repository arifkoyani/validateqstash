"use client"
import type React from "react"
import { useMemo, useRef, useState } from "react"
import { Download, ImageIcon, PaintBucket, RotateCw, X, MonitorUp, CircleCheck, AlertCircle } from "lucide-react"
import Spinner from "../ui/loader"

type FrameKey = "no-frame" | "frame.png" | "frame2.png" | "frame3.png" | "frame4.png" | "frame5.png" | "frame6.png" | "frame7.png" | "frame8.png"

type FrameConfig = {
	container: React.CSSProperties
	qrCode: React.CSSProperties
	qrImage: React.CSSProperties
	preview: {
		container: React.CSSProperties
		qrCode: React.CSSProperties
		qrImage: React.CSSProperties
	}
}

export default function PdfToQrcode() {
	// PDF Upload State
	const [pdfFile, setPdfFile] = useState<File | null>(null)
	const [pdfUrl, setPdfUrl] = useState<string>("")
	const [uploadingPdf, setUploadingPdf] = useState(false)
	const pdfInputRef = useRef<HTMLInputElement>(null)

	// Settings
	const [angle, setAngle] = useState<"0" | "1" | "2" | "3">("0")
	const [narrowBarWidth, setNarrowBarWidth] = useState(30)
	const [foreColor, setForeColor] = useState("#ff550d")
	const [backColor, setBackColor] = useState("#ffffff")
	const [logoFile, setLogoFile] = useState<File | null>(null)

	// Generation State
	const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)

	// Error State
	const [error, setError] = useState<{ message: string; type: "api" | "network" | "timeout" | "upload" | "validation" } | null>(null)

	// Frame Selection
	const [selectedFrame, setSelectedFrame] = useState<FrameKey>("no-frame")
	const frameRef = useRef<HTMLDivElement>(null)

	const frameConfigs: Record<FrameKey, FrameConfig> = useMemo(
		() => ({
			"no-frame": {
				container: {
					width: "240px",
					height: "240px",
					backgroundColor: "transparent",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: "240px",
					height: "240px",
				},
				qrImage: { maxWidth: "240px", maxHeight: "240px" },
				preview: {
					container: { width: "80px", height: "80px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "80px",
						height: "80px",
					},
					qrImage: { maxWidth: "80px", maxHeight: "80px" },
				},
			},
			"frame.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -65%)",
					width: "195px",
					height: "195px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-51%, -70%)",
						width: "55px",
						height: "55px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
			"frame2.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "40%",
					left: "60%",
					transform: "translate(-63%, -55%)",
					width: "170px",
					height: "170px",
				},
				qrImage: { maxWidth: "170px", maxHeight: "170px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "40%",
						left: "60%",
						transform: "translate(-63%, -56%)",
						width: "55px",
						height: "55px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
			"frame3.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "white",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "5%",
					left: "20%",
					transform: "translate(-11%, 6%)",
					width: "185px",
					height: "185px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "5%",
						left: "20%",
						transform: "translate(-11%, 8%)",
						width: "60px",
						height: "60px",
					},
					qrImage: { maxWidth: "60px", maxHeight: "60px" },
				},
			},
			"frame4.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-2%, -50%)",
					width: "115px",
					height: "115px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(4%, -52%)",
						width: "32px",
						height: "32px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
			"frame5.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-31%, -82%)",
					width: "142px",
					height: "142px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-27%, -89%)",
						width: "40px",
						height: "40px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
			"frame6.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -69%)",
					width: "195px",
					height: "195px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-49%, -75%)",
						width: "55px",
						height: "55px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
			"frame7.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-52%, -9%)",
					width: "112px",
					height: "112px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-52%, -9%)",
						width: "35px",
						height: "35px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
			"frame8.png": {
				container: {
					width: "240px",
					height: "280px",
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundColor: "transparent",
					position: "relative",
				},
				qrCode: {
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -72%)",
					width: "82px",
					height: "82px",
				},
				qrImage: { maxWidth: "185px", maxHeight: "185px" },
				preview: {
					container: { width: "80px", height: "96px" },
					qrCode: {
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -72%)",
						width: "59px",
						height: "29px",
					},
					qrImage: { maxWidth: "55px", maxHeight: "55px" },
				},
			},
		}),
		[]
	)

	const getCurrentFrameConfig = () => frameConfigs[selectedFrame] || frameConfigs["no-frame"]

	const isValidPdfFile = (file: File): boolean => {
		const validTypes = ["application/pdf"]
		const validExtensions = ["pdf"]
		const fileExtension = file.name.toLowerCase().split(".").pop()
		return validTypes.includes(file.type) || validExtensions.includes(fileExtension || "")
	}

	const handlePdfSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files
		if (files && files.length > 0) {
			const file = files[0]
			if (isValidPdfFile(file)) {
				setUploadingPdf(true)
				setPdfFile(file)
				setError(null)

				const formData = new FormData()
				formData.append("file", file)

				try {
					// Add timeout (30 seconds for file upload)
					const uploadPromise = fetch("/api/upload", {
						method: "POST",
						body: formData,
					})


					const timeoutPromise = createTimeoutPromise(30000)

					const response = await Promise.race([uploadPromise, timeoutPromise])

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}))
						const errorMessage = errorData?.message || `Upload failed with status ${response.status}`
						setError({ message: errorMessage, type: "api" })
						setPdfFile(null)
						return
					}

					const data = await response.json()

					if (data.error === false && data.url) {
						setPdfUrl(data.url)
						setError(null)
					} else {
						const errorMessage = data?.message || "PDF upload failed. Please try again."
						setError({ message: errorMessage, type: "upload" })
						setPdfFile(null)
					}
				} catch (error) {
					console.error("Upload error:", error)
					if (error instanceof Error) {
						if (error.message === "Request timeout") {
							setError({ message: "Upload timeout. Please check your connection and try again.", type: "timeout" })
						} else if (error instanceof TypeError && error.message.includes("fetch")) {
							setError({ message: "Network error. Please check your internet connection and try again.", type: "network" })
						} else {
							setError({ message: error.message || "PDF upload failed. Please try again.", type: "upload" })
						}
					} else {
						setError({ message: "PDF upload failed. Please try again.", type: "upload" })
					}
					setPdfFile(null)
				} finally {
					setUploadingPdf(false)
				}
			} else {
				setError({ message: "Please select a valid PDF file (.pdf)", type: "validation" })
			}
		}
		if (pdfInputRef.current) pdfInputRef.current.value = ""
	}

	const removePdf = () => {
		setPdfFile(null)
		setPdfUrl("")
		if (pdfInputRef.current) pdfInputRef.current.value = ""
	}

	const removeLogo = () => {
		setLogoFile(null)
	}

	const clearError = () => {
		setError(null)
	}

	// Helper function to create timeout promise
	const createTimeoutPromise = (timeoutMs: number) => {
		return new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
		})
	}

	const generateBarcode = async () => {
		if (!pdfUrl) {
			setError({ message: "Please upload a PDF file first", type: "validation" })
			return
		}

		setLoading(true)
		setUploadProgress(0)
		setError(null)

		let progressInterval: NodeJS.Timeout | null = null

		try {
			// Build request payload
			const formData = new FormData()
			formData.append("name", "barcode.png")
			formData.append("type", "QRCode")
			formData.append("value", pdfUrl)
			formData.append("inline", "true")
			formData.append("async", "false")
			formData.append(
				"profiles",
				JSON.stringify({
					Angle: Number(angle),
					NarrowBarWidth: narrowBarWidth,
					ForeColor: foreColor,
					BackColor: backColor,
				})
			)

			if (logoFile) {
				formData.append("decorationImageFile", logoFile)
			}

			progressInterval = setInterval(() => {
				setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 10))
			}, 120)

			// Call API (rate limiting handled server-side)
			const fetchPromise = fetch("/api/pdftoqrcode", {
				method: "POST",
				body: formData,
			})

			const timeoutPromise: Promise<never> = createTimeoutPromise(60000)

			let response = await Promise.race([fetchPromise, timeoutPromise])

			// Auto-retry once on 429 (rate limited) after a short wait
			if (response.status === 429) {
				await new Promise((resolve) => setTimeout(resolve, 1500))
				response = await Promise.race([
					fetch("/api/pdftoqrcode", { method: "POST", body: formData }),
					createTimeoutPromise(60000),
				])
			}

			if (progressInterval) {
				clearInterval(progressInterval)
			}
			setUploadProgress(100)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				const errorMessage = errorData?.message || `Barcode generation failed with status ${response.status}`
				setError({ message: errorMessage, type: "api" })
				return
			}

			const data = await response.json()

			if (data?.error === false && data?.url) {
				setBarcodeUrl(data.url)
				setError(null)
			} else {
				const errorMessage = data?.message || "Barcode generation failed. Please try again."
				setError({ message: errorMessage, type: "api" })
			}
		} catch (err) {
			console.error("Error:", err)
			if (progressInterval) {
				clearInterval(progressInterval)
			}
			if (err instanceof Error) {
				if (err.message === "Request timeout") {
					setError({ message: "Request timeout. The operation took too long. Please try again.", type: "timeout" })
				} else if (err instanceof TypeError && err.message.includes("fetch")) {
					setError({ message: "Network error. Please check your internet connection and try again.", type: "network" })
				} else {
					setError({ message: err.message || "Barcode generation failed. Please try again.", type: "api" })
				}
			} else {
				setError({ message: "Barcode generation failed. Please try again.", type: "api" })
			}
		} finally {
			setLoading(false)
			setTimeout(() => setUploadProgress(0), 800)
		}
	}

	const downloadBarcode = async () => {
		if (!barcodeUrl || !frameRef.current) {
			setError({ message: "QRCode not available for download", type: "validation" })
			return
		}

		try {
			if (selectedFrame === "no-frame") {
				const response = await fetch(barcodeUrl)
				const blob = await response.blob()
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = `barcode-QRCode-no-frame.png`
				document.body.appendChild(a)
				a.click()
				window.URL.revokeObjectURL(url)
				document.body.removeChild(a)
				return
			}

			// Preload both frame image and QRCode image to ensure they're loaded
			const frameImageUrl = `/frames/${selectedFrame}`
			const frameImage = new Image()
			frameImage.crossOrigin = "anonymous"

			// Preload QRCode image
			const qrCodeImage = new Image()
			qrCodeImage.crossOrigin = "anonymous"

			await Promise.all([
				new Promise<void>((resolve, reject) => {
					frameImage.onload = () => resolve()
					frameImage.onerror = () => reject(new Error("Failed to load frame image"))
					frameImage.src = frameImageUrl
				}),
				new Promise<void>((resolve, reject) => {
					qrCodeImage.onload = () => resolve()
					qrCodeImage.onerror = () => reject(new Error("Failed to load QRCode image"))
					qrCodeImage.src = barcodeUrl
				}),
			])

			// Wait a bit longer to ensure everything is rendered
			await new Promise((resolve) => setTimeout(resolve, 300))

			// @ts-ignore
			const html2canvasModule = await import("html2canvas")
			const html2canvas = html2canvasModule.default

			// Get background color from config (frame3.png has white background)
			const bgColor = selectedFrame === "frame3.png" ? "#ffffff" : "transparent"

			if (!frameRef.current) {
				throw new Error("Frame container not found")
			}

			const canvas = await html2canvas(frameRef.current, {
				backgroundColor: bgColor,
				scale: 2,
				useCORS: true,
				allowTaint: true, // Changed to true to allow cross-origin images
				logging: false,
				width: frameRef.current.offsetWidth,
				height: frameRef.current.offsetHeight,
				onclone: (clonedDoc: Document) => {
					// Ensure background images are properly rendered in cloned document
					const clonedElement = clonedDoc.querySelector('[data-frame-container]') as HTMLElement
					if (clonedElement && frameRef.current) {
						// Get computed styles from original element
						const originalElement = frameRef.current
						const computedStyle = window.getComputedStyle(originalElement)

						// Copy all relevant styles
						clonedElement.style.width = computedStyle.width
						clonedElement.style.height = computedStyle.height
						clonedElement.style.backgroundImage = computedStyle.backgroundImage
						clonedElement.style.backgroundSize = computedStyle.backgroundSize
						clonedElement.style.backgroundRepeat = computedStyle.backgroundRepeat
						clonedElement.style.backgroundPosition = computedStyle.backgroundPosition
						clonedElement.style.backgroundColor = computedStyle.backgroundColor
						clonedElement.style.position = computedStyle.position

						// Ensure QRCode image is loaded in cloned document
						const clonedImg = clonedElement.querySelector("img") as HTMLImageElement
						if (clonedImg) {
							clonedImg.src = barcodeUrl
							clonedImg.crossOrigin = "anonymous"
						}
					}
				},
			})

			canvas.toBlob(
				(blob: Blob | null) => {
					if (!blob) {
						setError({ message: "Failed to generate image blob", type: "api" })
						return
					}
					const url = window.URL.createObjectURL(blob)
					const a = document.createElement("a")
					a.href = url
					a.download = `barcode-QRCode-${selectedFrame.replace(".png", "")}.png`
					document.body.appendChild(a)
					a.click()
					window.URL.revokeObjectURL(url)
					document.body.removeChild(a)
				},
				"image/png",
				1.0
			)
		} catch (error) {
			console.error("Download error:", error)
			setError({
				message: error instanceof Error ? error.message : "Failed to download QRCode with frame. Trying fallback...",
				type: "api",
			})

			// Fallback: download raw barcode
			try {
				const response = await fetch(barcodeUrl)
				if (!response.ok) throw new Error("Failed to fetch barcode")
				const blob = await response.blob()
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = `barcode-QRCode.png`
				document.body.appendChild(a)
				a.click()
				window.URL.revokeObjectURL(url)
				document.body.removeChild(a)
			} catch (fallbackError) {
				console.error("Fallback download error:", fallbackError)
				setError({
					message: "Failed to download QRCode. Please try again.",
					type: "api",
				})
			}
		}
	}

	const resetGenerator = () => {
		setPdfFile(null)
		setPdfUrl("")
		setAngle("0")
		setNarrowBarWidth(30)
		setForeColor("#ff550d")
		setBackColor("#ffffff")
		setLogoFile(null)
		setBarcodeUrl(null)
		setSelectedFrame("no-frame")
		setError(null)
		if (pdfInputRef.current) pdfInputRef.current.value = ""
	}

	return (
		<div className="px-2 sm:px-4 md:px-6 lg:px-0 max-w-7xl mx-auto bg-transparent relative">
			<div className="text-center space-y-1 sm:space-y-2 mb-4 sm:mb-6 md:mb-8">
				<div className="flex flex-wrap justify-center items-center mx-auto text-neutral-600 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl gap-1 sm:gap-2">
					Barcode Generator
				</div>
				<p className="text-xs sm:text-sm md:text-base text-gray-600 px-2">Generate barcode from PDF with styles, logo and frames</p>
			</div>

			{/* Modal Loader Overlay */}
			{loading && (
				<div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
					<div className="bg-transparent rounded-xl sm:rounded-2xl max-w-md w-full">
						<div className="flex bg-transparent flex-col items-center justify-center gap-3 sm:gap-4">
							<div className="bg-transparent">
								<Spinner />
							</div>
							<div className="text-center bg-transparent">
								<h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Generating QRCode...</h3>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Error Message UI */}
			{error && (
				<div className="mb-4 sm:mb-5 md:mb-6">
					<div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 sm:p-4 shadow-sm">
						<div className="flex items-start gap-3">
							<div className="flex-shrink-0">
								<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1">
										<h4 className="text-sm sm:text-base font-semibold text-red-800 mb-1">
											{error.type === "api" && "Fail Check Your Connection OR refresh page"}
											{error.type === "network" && "Network Error"}
											{error.type === "timeout" && "Request Timeout"}
											{error.type === "upload" && "Upload Failed"}
											{error.type === "validation" && "Validation Error"}
										</h4>
										<p className="text-xs sm:text-sm text-red-700">{error.message}</p>
									</div>
									<button
										onClick={clearError}
										className="flex-shrink-0 p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
										aria-label="Close error"
									>
										<X className="h-4 w-4" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{!barcodeUrl ? (
				<div className="space-y-4 sm:space-y-5 md:space-y-6 relative min-h-[400px] sm:min-h-[480px] md:min-h-[520px]">
					{/* PDF Upload Section (hide after upload) */}
					{!pdfUrl ? (
						<div className="space-y-2 sm:space-y-3">
							<label className="text-xs sm:text-sm font-semibold text-gray-700">Upload PDF File</label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center hover:border-[#ff550d] transition-colors">
								<input
									ref={pdfInputRef}
									type="file"
									accept=".pdf"
									onChange={handlePdfSelect}
									className="hidden"
									id="pdf-upload"
								/>
								<label htmlFor="pdf-upload" className="cursor-pointer">
									{uploadingPdf ? (
										<div className="flex flex-col items-center justify-center gap-2 sm:gap-3">
											<div style={{ transform: "scale(0.5) sm:scale(0.6)" }}>
												<Spinner />
											</div>
											<p className="text-sm sm:text-base text-gray-600">Uploading PDF...</p>
										</div>
									) : (
										<>
											<MonitorUp className="mx-auto h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-[#ff550d] mb-2 sm:mb-3 md:mb-4" />
											<p className="text-sm sm:text-base text-gray-600">Click to upload a PDF file</p>
											<p className="text-xs sm:text-sm text-gray-400 mt-1">PDF files only</p>
										</>
									)}
								</label>
							</div>
						</div>
					) : (
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 bg-white rounded-lg border border-gray-100 shadow-sm px-3 sm:px-4 py-2.5 sm:py-3 hover:shadow-md transition-all duration-200">
							<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
								<div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ff550d] to-[#ff911d] rounded-lg flex items-center justify-center">
									<MonitorUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
								</div>
								<a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity">
								<p className="text-xs text-gray-500 font-medium uppercase tracking-wide">PDF uploaded</p>
								<p className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium truncate mt-0.5 underline">{pdfFile?.name || "Your file"}</p>
							</a>
							</div>
							<button
								onClick={removePdf}
								className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 w-full sm:w-auto justify-center sm:justify-start"
							>
								<X className="h-3.5 w-3.5" />
								Change
							</button>
						</div>
					)}

					{/* Settings Section */}
					{pdfUrl && (
						<>
							<div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 md:space-y-5">
								<div className="flex items-center gap-2 pb-2 sm:pb-3 border-b border-gray-100">
									<div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#ff550d] to-[#ff911d] rounded-lg flex items-center justify-center">
										<PaintBucket className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
									</div>
									<h3 className="text-sm sm:text-base font-semibold text-gray-900">Styling</h3>
								</div>

								<div className="grid grid-cols-2 gap-3 sm:gap-4">
									<div className="space-y-1.5 sm:space-y-2">
										<label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Foreground</label>
										<div className="relative">
											<input
												type="color"
												value={foreColor}
												onChange={(e) => setForeColor(e.target.value)}
												className="w-full sm:w-16 h-9 sm:h-10 rounded-lg border border-gray-200 cursor-pointer hover:border-[#ff550d] transition-colors shadow-sm"
											/>
										</div>
									</div>

									<div className="space-y-1.5 sm:space-y-2">
										<label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Background</label>
										<div className="relative">
											<input
												type="color"
												value={backColor}
												onChange={(e) => setBackColor(e.target.value)}
												className="w-full sm:w-16 h-9 sm:h-10 rounded-lg border border-gray-200 cursor-pointer hover:border-[#ff550d] transition-colors shadow-sm"
											/>
										</div>
									</div>
								</div>

								<div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
									<div className="flex items-center justify-between gap-2">
										<label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Barcode Pixel Size</label>
										<span className="text-xs sm:text-sm font-semibold text-gray-900 bg-gray-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md whitespace-nowrap">{narrowBarWidth}</span>
									</div>
									<input
										type="range"
										min={1}
										max={100}
										value={narrowBarWidth}
										onChange={(e) => setNarrowBarWidth(Number(e.target.value))}
										className="w-full h-1 sm:h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer slider"
										style={{
											background: `linear-gradient(to right, #ff550d 0%, #ff911d ${narrowBarWidth}%, #e5e7eb ${narrowBarWidth}%, #e5e7eb 100%)`,
										}}
									/>
								</div>

								<div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
									<label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-1.5 sm:gap-2">
										<RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
										Rotation
									</label>
									<select
										value={angle}
										onChange={(e) => setAngle(e.target.value as "0" | "1" | "2" | "3")}
										className="w-full h-10 sm:h-11 px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg focus:border-[#ff550d] focus:ring-2 focus:ring-[#ff550d]/20 focus:outline-none transition-all cursor-pointer hover:border-gray-300"
									>
										<option value="0">0° (Normal)</option>
										<option value="1">90° (Right)</option>
										<option value="2">180° (Upside down)</option>
										<option value="3">270° (Left)</option>
									</select>
								</div>
							</div>

							<div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 md:p-5">
								<label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2 sm:mb-3 block">Logo Image <span className="text-gray-400 normal-case">(Optional)</span></label>

								{!logoFile ? (
									<div className="border border-dashed border-gray-200 rounded-lg p-4 sm:p-5 md:p-6 text-center hover:border-[#ff550d] hover:bg-[#fff5f0]/30 transition-all duration-200 cursor-pointer group">
										<input
											type="file"
											accept="image/*"
											onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
											className="hidden"
											id="logo-upload"
										/>
										<label htmlFor="logo-upload" className="cursor-pointer">
											<div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 bg-gradient-to-br from-[#ff550d] to-[#ff911d] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
												<ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
											</div>
											<p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Click to upload logo</p>
											<p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
										</label>
									</div>
								) : (
									<div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-100">
										<div className="flex items-center justify-between gap-2">
											<div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
												<div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ff550d] to-[#ff911d] rounded-lg flex items-center justify-center">
													<ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{logoFile.name}</p>
													<p className="text-xs text-gray-500 mt-0.5">Will upload on Generate</p>
												</div>
											</div>
											<button
												onClick={removeLogo}
												className="flex-shrink-0 p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
											>
												<X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
											</button>
										</div>
									</div>
								)}
							</div>

							<button
								onClick={generateBarcode}
								disabled={loading || !pdfUrl}
								className="w-full h-11 sm:h-12 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white text-sm sm:text-base font-semibold rounded-lg hover:from-[#e6490b] hover:to-[#e6820a] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
							>
								Generate Barcodes
							</button>

						</>
					)}
				</div>
			) : (
				/* Result View - Show QRCode with frames */
				<div className="space-y-4 sm:space-y-5 md:space-y-6 mt-4 sm:mt-5 md:mt-6">
					<div className="bg-white flex flex-col rounded-lg sm:rounded-xl md:rounded-2xl border border-gray-200 p-3 sm:p-4 md:p-6 overflow-hidden">
						<div className="text-center mb-4 sm:mb-5 md:mb-6">
							<h3 className="text-lg sm:text-xl font-semibold text-gray-800">Generated Barcode</h3>
						</div>

						<div className="flex-1 flex items-center justify-center min-h-0">
							<div className="w-full h-full overflow-hidden">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 h-full items-start">
									{/* QRCode Preview - First on mobile, second on desktop */}
									<div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6 md:space-y-8 p-2 sm:p-3 md:p-4 order-1 lg:order-2">
										{/* QRCode Preview */}
										{barcodeUrl && (
											<div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full">
												<h4 className="text-xs sm:text-sm font-semibold text-gray-700">QRCode Preview</h4>
												<div
													ref={frameRef}
													data-frame-container
													className={`inline-block p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl transition-shadow duration-300 qr-frame-container flex-shrink-0 ${selectedFrame === "no-frame" ? "shadow-none p-0" : "shadow-xl hover:shadow-2xl p-2 sm:p-3 md:p-4"
														}`}
													style={{
														backgroundImage: selectedFrame !== "no-frame" ? `url('/frames/${selectedFrame}')` : "none",
														...getCurrentFrameConfig().container,
													}}
												>
													<div className="absolute inset-0 flex justify-center items-center" style={getCurrentFrameConfig().qrCode}>
														<img
															src={barcodeUrl}
															alt="Generated QRCode"
															className="w-full h-full object-contain filter drop-shadow-sm"
															style={getCurrentFrameConfig().qrImage}
														/>
													</div>
												</div>
												<div className="w-full flex items-center justify-center bg-[#e9fdea] rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
													<CircleCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#4caf56] flex-shrink-0" />
													<p className="text-xs sm:text-sm text-[#4caf56] px-2 py-1 text-center">Great! Your QR code is easy to scan.</p>
												</div>

												<button
													onClick={downloadBarcode}
													className="w-full max-w-full sm:max-w-sm cursor-pointer inline-flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#ff550d] to-[#ff911d] text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-[#e6490b] hover:to-[#e6820a] transition-all duration-300 shadow-lg hover:shadow-xl"
												>
													<Download className="h-4 w-4 sm:h-5 sm:w-5" />
													<span>Download QRCode</span>
												</button>
											</div>
										)}
									</div>

									{/* Choose Frame Style - Second on mobile, first on desktop */}
									<div className="flex flex-col items-center justify-start p-2 sm:p-3 md:p-4 space-y-4 sm:space-y-5 md:space-y-6 order-2 lg:order-1">
										{/* QRCode Frame Selection */}
										<div className="w-full">
											<h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">Choose Frame Style</h4>
											<div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 items-center w-full max-w-full md:max-w-[480px] mx-auto">
												{(["no-frame", "frame.png", "frame2.png", "frame3.png", "frame4.png", "frame5.png", "frame6.png", "frame7.png", "frame8.png"] as FrameKey[]).map((frameFile, index) => {
													const frameConfig = frameConfigs[frameFile]
													const frameNames = ["Normal", "Classic", "Modern", "Elegant", "Frame 4", "Frame 5", "Frame 6", "Frame 7", "Frame 8"]

													return (
														<div
															key={frameFile}
															onClick={() => setSelectedFrame(frameFile)}
															className={`p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl transition-all duration-300 w-full group ${selectedFrame === frameFile
																? "border border-[#ffcc99] bg-transparent"
																: "hover:bg-gradient-to-br hover:from-gray-50 hover:to-white hover:shadow-lg border border-gray-200 hover:border-gray-300 transform"
																}`}
														>
															<div
																className="bg-white rounded-lg border border-gray-200 mb-3 relative mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-100"
																style={{
																	backgroundImage: frameFile !== "no-frame" ? `url('/frames/${frameFile}')` : "none",
																	backgroundSize: "contain",
																	backgroundRepeat: "no-repeat",
																	backgroundPosition: "center",
																	backgroundColor: frameFile === "no-frame" ? "transparent" : "white",
																	border: frameFile === "no-frame" ? "none" : "1px solid #e5e7eb",
																	position: "relative",
																	...frameConfig.preview.container,
																}}
															>
																<div
																	className="absolute inset-0 flex items-center justify-center"
																	style={frameConfig.preview.qrCode}
																>
																	{barcodeUrl && (
																		<img
																			src={barcodeUrl}
																			alt="QRCode Preview"
																			className="w-full h-full object-contain filter drop-shadow-sm"
																			style={frameConfig.preview.qrImage}
																		/>
																	)}
																</div>
															</div>

															<div className="text-center">
																<p
																	className={`text-[10px] sm:text-xs font-semibold transition-colors duration-200 ${selectedFrame === frameFile ? "text-[#ff550d]" : "text-gray-600 group-hover:text-gray-800"
																		}`}
																>
																	{frameNames[index]}
																</p>
															</div>
														</div>
													)
												})}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<button
						onClick={resetGenerator}
						className="w-full h-11 sm:h-12 py-2.5 sm:py-3 md:py-4 bg-gray-100 text-gray-700 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 border-2 border-gray-300"
					>
						Generate Another Barcode
					</button>
				</div>
			)}

			<style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff550d, #ff911d);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff550d, #ff911d);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .qr-frame-container {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .qr-frame-container img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          filter: contrast(1.1);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
		</div>
	)
}
