const localCatImagesByName = {
  나비: '/cat_dummy_05_gray_white.jpg',
  카오스: '/cat_dummy_02_tabby.jpg',
  치즈: '/cat_dummy_01_orange.jpg',
  까미: '/cat_dummy_03_tuxedo.jpg',
  공주: '/cat_dummy_04_calico.jpg'
};

const publicImageAliases = {
  '/cat_dummy_01_orange.png': '/cat_dummy_01_orange.jpg',
  '/cat_dummy_02_tabby.png': '/cat_dummy_02_tabby.jpg',
  '/cat_dummy_03_tuxedo.png': '/cat_dummy_03_tuxedo.jpg',
  '/cat_dummy_04_calico.png': '/cat_dummy_04_calico.jpg',
  '/cat_dummy_05_gray_white.png': '/cat_dummy_05_gray_white.jpg'
};

function normalizePublicPath(path) {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return publicImageAliases[normalizedPath] || normalizedPath;
}

export function getCatImageUrl(cat) {
  const localImage =
    cat?.publicImageUrl ||
    cat?.localImageUrl ||
    cat?.publicImagePath ||
    localCatImagesByName[cat?.name];

  if (localImage) return normalizePublicPath(localImage);

  return normalizePublicPath(
    cat?.imageUrl ||
      cat?.photoUrl ||
      cat?.profileImageUrl ||
      cat?.thumbnailUrl ||
      ''
  );
}
