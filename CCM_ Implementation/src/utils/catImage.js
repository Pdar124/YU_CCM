import catDummyOrange from '../assests/cat_dummy_01_orange.jpg';
import catDummyTabby from '../assests/cat_dummy_02_tabby.jpg';
import catDummyTuxedo from '../assests/cat_dummy_03_tuxedo.jpg';
import catDummyCalico from '../assests/cat_dummy_04_calico.jpg';
import catDummyGrayWhite from '../assests/cat_dummy_05_gray_white.jpg';

const localCatImagesByName = {
  나비: catDummyGrayWhite,
  카오스: catDummyTabby,
  치즈: catDummyOrange,
  까미: catDummyTuxedo,
  공주: catDummyCalico
};

export function getCatImageUrl(cat) {
  const localImage = localCatImagesByName[cat?.name];

  if (localImage) return localImage;

  return (
    cat?.imageUrl ||
    cat?.photoUrl ||
    cat?.profileImageUrl ||
    cat?.thumbnailUrl ||
    ''
  );
}
