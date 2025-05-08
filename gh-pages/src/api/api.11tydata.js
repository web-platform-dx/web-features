module.exports = async function () {
  const { features } = await import("../../../packages/web-features/index.js");
  return {
    features: Object.keys(features).map((id) => ({ ...features[id], id })),
    featureList: { features: Object.keys(features) },
  };
};
