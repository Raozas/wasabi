import { Card } from "@heroui/react";
import { SlidersHorizontal } from "@phosphor-icons/react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../../hooks/useProducts";
import styles from "./ProductBrowseTools.module.css";

export function ProductBrowseTools() {
  const { products } = useProducts({ publicOnly: true });
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryMeta = useMemo(() => {
    const counts = products.reduce((result, product) => {
      const category = String(product.category ?? "").trim();
      if (!category) return result;
      result[category] = (result[category] ?? 0) + 1;
      return result;
    }, {});

    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((left, right) => left.category.localeCompare(right.category));
  }, [products]);

  const requestedCategory = searchParams.get("category") ?? "all";
  const activeCategory = useMemo(() => {
    if (requestedCategory === "all") return "all";
    return categoryMeta.some((item) => item.category === requestedCategory)
      ? requestedCategory
      : "all";
  }, [categoryMeta, requestedCategory]);

  function updateSearchParams(updater) {
    const nextSearchParams = new URLSearchParams(searchParams);
    updater(nextSearchParams);
    setSearchParams(nextSearchParams);
  }

  function handleCategoryChange(nextCategory) {
    updateSearchParams((nextSearchParams) => {
      if (nextCategory === "all") {
        nextSearchParams.delete("category");
      } else {
        nextSearchParams.set("category", nextCategory);
      }
    });
  }

  const allCategories = [
    { category: "all", count: products.length },
    ...categoryMeta,
  ];

  return (
    <Card className={styles.panel}>
      <Card.Content className={styles.inner}>
        <div className={styles.section}>
          <div className={styles.labelRow}>
            <span className={styles.labelIcon}>
              <SlidersHorizontal size={13} weight="fill" />
            </span>
            <span className={styles.label}>Categories</span>
            <span className={styles.labelDivider} />
            <span className={styles.labelCount}>{categoryMeta.length} types</span>
          </div>

          <div className={styles.chips}>
            {allCategories.map((item) => {
              const isActive =
                item.category === activeCategory ||
                (item.category === "all" && activeCategory === "all");
              return (
                <button
                  key={item.category}
                  type="button"
                  className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                  onClick={() => handleCategoryChange(item.category)}
                >
                  <span className={styles.chipLabel}>
                    {item.category === "all" ? "All" : item.category}
                  </span>
                  <span className={styles.chipBadge}>{item.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}