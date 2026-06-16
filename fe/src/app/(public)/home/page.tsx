import Category from "./_components/category";
import ProductList from "./_components/product_list";

export const metadata = {
  title: "JK Keyboard - Home",
  description: "Homepage",
};
export default function Home() {
  return (
    <div>
      <div className="hidden md:block ">
        <Category />
      </div>

      <ProductList type={"KeyboardKit"} />
      <ProductList type={"Prebuild"} />
      <ProductList type={"Keycap"} />
      <ProductList type={"Switch"} />
    </div>
  );
}
