// src/services/productImages.js
// Comprehensive image mapping and reliable fallbacks for BajriX construction materials

export const PRODUCT_IMAGE_FALLBACKS = {
  // UltraTech PPC Cement 50 kg
  1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjr53CbnvPVQV8Zs9A-38YQHBSX53PF_YTQaghMdy_QyReC6q_bsepzpCnra8tBxSkZ67UfFutWmv4pHeERkmbzV7jEcVcRK4y0SHPcmkrsZiWGpp423Lg0-hfwJghZl9Zo9HkNdoSSVoxP9M71P06lmodOWX8lkrBPFYL6vxrNWyn0DVq_wr50sjbwWO4rQRnxDrCtlDT0xJ1LG7J1uyB4uNp7nFFSrF8T_8hTOSpFZGWTcDrcXg',
  
  // Tata Tiscon 550D TMT Rebar (12mm)
  2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJH0Q4PS9XKRgmbHNiceb25iN1ECr4Anms1BorySXsrc4YlGNmsnlGsu8FzO3Tzd_jKlJ-6PrVd99PzYjK3zfwQhsZQ__CAL6JLWtwkINimBYkEcgZI9gc3j8MZ67Y6NBIpVrUsORimeCzxs1_lTOhFmpxPReaOpvFSBZW2Fp9f4K_o0u-If2z_gd0KQTHFecosFy1ITbN4750yRtW-XosRd_ZFeq6cmyffXpD5xgB68hJm2FK5zI',
  
  // Red Clay Kiln-Burnt Bricks (Class 1)
  3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdPDu2Nv-BNLwezChnAaW3Buk854B6W_8j3u2wBKxdMjKV8e8Eg-9XvkMNnnslamrfLaF0n9JbZzgBMN5ErkmlnSs5XtCaQOuaPAXF_bZESnX_p4TeVJ78QrTE-9oaokwWAYrd4fdv23B9sGqL5CknhBwuRZd9pF-qj7VoYIGf644oLSswRrRCAcqhXTNAOjvOXXsTYi5r2USNaHOoEMx6oKPSrKPTmwvMSkHXkxpUtgGnFhmQaYg',
  
  // M-Sand (Plastering Grade)
  4: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeiH2_WSZE9yATV58UtwgOeJqPa20icOgLH5gUinS-DjaXzKY9gZG3o-eNBIrBeOjJTQmBsThx6JhZYysbU0EBmN17bbH_3dyXVT-xG6zCR0uyLk6h3MpvgiWcL51JDrieP4TB_80zyQ4LSZmMuqizWVcxKx8xUWOLMiiKeIIZTC6e1cwzMOcBrC5aWIij3gi3_cpPsf0zDtVVdohBEbpw7G95pjWh0HSoDA_TY2EBQgaJPFZvBCw',
  
  // Blue Metal Crushed Aggregate 20mm
 
  5: 'https://5.imimg.com/data5/SELLER/Default/2025/5/507367376/PJ/CH/BN/107834600/20-mm-blue-metal-construction-aggregates.jpg',
  // Astral CPVC Pro Pipes 1-inch (3m)
  6: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80',
  
  // Finolex 2.5 sq mm FR Copper Wire (90m coil)
  7: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&auto=format&fit=crop&q=80',
  
  // Dr. Fixit 101 LW+ Waterproofing Chemical
  8: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80',
  
  // UltraTech Super Cement (Weather Plus) 50 kg
  9: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD162OUJe-kTJbBig4K3OS1qO6A1eUPjYiQGWxWcXJGJ_HulSpFA-KT5KJ4y0bVsdiHNxgkrdG2G3_QOwxTDFpQ16TAxSlWLuAMXngYwYz1zzvLTE62XgjqBSvcgEVCLASo_xWUQtAKPwCoA2rz4buX-jV22xxgBFOVeHSH5b_NkCL6SRyr2A4edxMHL8YZn_xaQGMOflQXwbWRKHMaYzHm-cAp6vSSHwHDoKjk-XGfiDKdo0_iKRw',
  
  // Birla Aerocon AAC Blocks (600x200x150mm)
  10: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjvDiiTcc2aokQuXpkdHfPuMpt7HRItSHW_iRTGVh0r7jd2uHxeRCnVsR19ThveX6pbJUQtuehZyFRTY6olwlgbMwZ2kQfA6f57A3v5tfocsDzcA2d0aXra0yO8DtoL5Tq3FwvsInTfiJ5JsiQALv7z2IA3tT5do9W0smAARTAAHmHpd02Tbw1M9Rcv3EZS2Lp3uva-S_Crc_d5FeyuXhfgXPnyv-DvXOZgMvXpMdvodbtwkRByRI'
};

export const CATEGORY_IMAGE_DEFAULTS = {
  Cement: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjr53CbnvPVQV8Zs9A-38YQHBSX53PF_YTQaghMdy_QyReC6q_bsepzpCnra8tBxSkZ67UfFutWmv4pHeERkmbzV7jEcVcRK4y0SHPcmkrsZiWGpp423Lg0-hfwJghZl9Zo9HkNdoSSVoxP9M71P06lmodOWX8lkrBPFYL6vxrNWyn0DVq_wr50sjbwWO4rQRnxDrCtlDT0xJ1LG7J1uyB4uNp7nFFSrF8T_8hTOSpFZGWTcDrcXg',
  'Steel & TMT': 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJH0Q4PS9XKRgmbHNiceb25iN1ECr4Anms1BorySXsrc4YlGNmsnlGsu8FzO3Tzd_jKlJ-6PrVd99PzYjK3zfwQhsZQ__CAL6JLWtwkINimBYkEcgZI9gc3j8MZ67Y6NBIpVrUsORimeCzxs1_lTOhFmpxPReaOpvFSBZW2Fp9f4K_o0u-If2z_gd0KQTHFecosFy1ITbN4750yRtW-XosRd_ZFeq6cmyffXpD5xgB68hJm2FK5zI',
  'Bricks & Blocks': 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdPDu2Nv-BNLwezChnAaW3Buk854B6W_8j3u2wBKxdMjKV8e8Eg-9XvkMNnnslamrfLaF0n9JbZzgBMN5ErkmlnSs5XtCaQOuaPAXF_bZESnX_p4TeVJ78QrTE-9oaokwWAYrd4fdv23B9sGqL5CknhBwuRZd9pF-qj7VoYIGf644oLSswRrRCAcqhXTNAOjvOXXsTYi5r2USNaHOoEMx6oKPSrKPTmwvMSkHXkxpUtgGnFhmQaYg',
  'Sand & Aggregates': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeiH2_WSZE9yATV58UtwgOeJqPa20icOgLH5gUinS-DjaXzKY9gZG3o-eNBIrBeOjJTQmBsThx6JhZYysbU0EBmN17bbH_3dyXVT-xG6zCR0uyLk6h3MpvgiWcL51JDrieP4TB_80zyQ4LSZmMuqizWVcxKx8xUWOLMiiKeIIZTC6e1cwzMOcBrC5aWIij3gi3_cpPsf0zDtVVdohBEbpw7G95pjWh0HSoDA_TY2EBQgaJPFZvBCw',
  Plumbing: 'https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80',
  Electrical: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&auto=format&fit=crop&q=80',
  Chemicals: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format&fit=crop&q=80'
};

export function getProductImageUrl(product) {
  if (!product) return null;
  if (product.imageUrl && product.imageUrl.trim()) {
    // If it's one of the outdated mismatched unsplash links from the old seed, upgrade it:
    if (product.id && PRODUCT_IMAGE_FALLBACKS[product.id]) {
      return PRODUCT_IMAGE_FALLBACKS[product.id];
    }
    return product.imageUrl;
  }
  if (product.id && PRODUCT_IMAGE_FALLBACKS[product.id]) {
    return PRODUCT_IMAGE_FALLBACKS[product.id];
  }
  if (product.category && CATEGORY_IMAGE_DEFAULTS[product.category]) {
    return CATEGORY_IMAGE_DEFAULTS[product.category];
  }
  return null;
}
