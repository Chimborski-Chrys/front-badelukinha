const CLOUDINARY_CLOUD_NAME = 'dawzpqnxl' // Replace with your Cloudinary cloud name

export const getCloudinaryUrl = (publicId, options = {}) => {
  if (!publicId) {
    return null
  }

  const transformations = []
  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)
  if (options.crop) transformations.push(`c_${options.crop}`)
  if (options.gravity) transformations.push(`g_${options.gravity}`)
  if (options.radius) transformations.push(`r_${options.radius}`)
  if (options.border) {
    const border = options.border
    transformations.push(`bo_${border.width}px_solid_${border.color}`)
  }

  const transformationString = transformations.join(',')

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}/${publicId}`
}
