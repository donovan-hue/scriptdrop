import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';
import ARTryOn from './ARTryOn';

/**
 * Example Product component showing AR integration
 * This demonstrates how to use the AR Virtual Try-on system
 */

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MainImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 12px;
  background: #f5f5f5;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  img {
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const ARButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ProductHeader = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: #333;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 14px;

    .stars {
      color: #fbbf24;
    }
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;

  .original-price {
    font-size: 18px;
    color: #999;
    text-decoration: line-through;
  }

  .current-price {
    font-size: 32px;
    font-weight: 700;
    color: #667eea;
  }

  .discount {
    display: inline-block;
    background: #ef4444;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }
`;

const Description = styled.p`
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
`;

const OptionsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  .options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

const OptionButton = styled(motion.button)`
  padding: 10px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  transition: all 0.3s ease;

  ${(props) =>
    props.selected &&
    `
    border-color: #667eea;
    background: #667eea;
    color: white;
  `}

  &:hover {
    border-color: #667eea;
  }
`;

const ARPreview = styled.div`
  background: #f9fafb;
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .icon {
    font-size: 32px;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 14px;
  }
`;

const ARBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;

  svg {
    width: 16px;
    height: 16px;
  }
`;

/**
 * Example Product Component with AR Integration
 */
const ARProductExample = ({ productId = '507f1f77bcf86cd799439011' }) => {
  const [showARTryOn, setShowARTryOn] = useState(false);
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [mainImage, setMainImage] = useState(
    'https://images.unsplash.com/photo-1606228174351-4def090b83c4?w=500&h=500&fit=crop'
  );

  const product = {
    _id: productId,
    name: 'Premium Leather Jacket',
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    rating: 4.8,
    reviews: 324,
    description:
      'Elevate your style with our premium leather jacket. Crafted from 100% genuine Italian leather with a modern fit and timeless design.',
    colors: ['black', 'brown', 'tan', 'navy'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1606228174351-4def090b83c4?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1495121553079-4c61bcce1894?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1561828820-a83f29e9b86f?w=500&h=500&fit=crop',
    ],
  };

  return (
    <ProductContainer>
      {showARTryOn && (
        <ARTryOn
          productId={product._id}
          productName={product.name}
          onClose={() => setShowARTryOn(false)}
        />
      )}

      <ImageSection>
        <MainImage src={mainImage} alt={product.name} />
        <ThumbnailGrid>
          {product.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`View ${idx + 1}`}
              onClick={() => setMainImage(img)}
            />
          ))}
        </ThumbnailGrid>
      </ImageSection>

      <InfoSection>
        <ProductHeader>
          <h1>{product.name}</h1>
          <div className="rating">
            <span className="stars">★ ★ ★ ★ ★</span>
            <span>
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>
        </ProductHeader>

        <PriceSection>
          <span className="original-price">${product.originalPrice}</span>
          <span className="current-price">${product.price}</span>
          <span className="discount">{product.discount}% OFF</span>
        </PriceSection>

        <Description>{product.description}</Description>

        <ARPreview>
          <ARBadge>
            <FiAward /> Virtually Try-On Available
          </ARBadge>
          <div className="icon">👕</div>
          <p>
            Use our AR Virtual Try-On to see how this item looks on you before
            buying!
          </p>
        </ARPreview>

        <OptionsSection>
          <OptionGroup>
            <label>Color</label>
            <div className="options">
              {product.colors.map((color) => (
                <OptionButton
                  key={color}
                  selected={selectedColor === color}
                  onClick={() => setSelectedColor(color)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </OptionButton>
              ))}
            </div>
          </OptionGroup>

          <OptionGroup>
            <label>Size</label>
            <div className="options">
              {product.sizes.map((size) => (
                <OptionButton
                  key={size}
                  selected={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {size}
                </OptionButton>
              ))}
            </div>
          </OptionGroup>
        </OptionsSection>

        <div>
          <ARButton
            onClick={() => setShowARTryOn(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>🔍</span> Try On with AR
          </ARButton>
        </div>

        <motion.button
          style={{
            padding: '16px 24px',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Add to Cart
        </motion.button>
      </InfoSection>
    </ProductContainer>
  );
};

export default ARProductExample;
