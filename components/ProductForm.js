import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { data } from "autoprefixer";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  discountPrice: existingDiscountPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  const router = useRouter();
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [category, setCategory] = useState(assignedCategory || "");
  const [productProperties, setProductProperties] = useState(
    assignedProperties || {}
  );
  const [price, setPrice] = useState(existingPrice || "");
  const [discountPrice, setDiscountPrice] = useState(
    existingDiscountPrice || ""
  );
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cancelUpload, setCancelUpload] = useState(null);
  const [removedImages, setRemovedImages] = useState([]);

  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);
  async function saveProduct(e) {
    e.preventDefault();
    const data = {
      title,
      description,
      price,
      discountPrice,
      images,
      category,
      properties: productProperties,
    };
    if (data.category == "") {
      data.category = null;
    }
    if (_id) {
      // update
      await axios.put("/api/products", { ...data, _id });
    } else {
      //create
      await axios.post("/api/products", data);
    }
    for (const imageUrl of removedImages) {
      await axios.delete(`/api/remove?url=${encodeURIComponent(imageUrl)}`);
    }
    setGoToProducts(true);
  }
  if (goToProducts) {
    router.push("/products");
  }

  async function uploadImages(e) {
    const files = e.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      try {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        setCancelUpload(source);

        const res = await axios.post("/api/upload", data, {
          cancelToken: source.token,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });
        setImages((oldImages) => {
          return [...oldImages, ...res.data.links];
        });
        setIsUploading(false);
      } catch (err) {
        console.error("Error uploading images:", err);
      }
    }
  }

  function removeImage(imageUrl) {
    setImages((oldImages) => {
      return oldImages.filter((url) => url !== imageUrl);
    });
    setRemovedImages((oldRemovedImages) => {
      return [...oldRemovedImages, imageUrl];
    });
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?._id) {
      const parentCatInfo = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(...parentCatInfo.properties);
      catInfo = parentCatInfo;
    }
  }

  return (
    <div>
      <form onSubmit={saveProduct}>
        <label>Product name</label>
        <input
          type="text"
          placeholder="Product name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Category</label>
        <select
          value={category}
          onChange={(ev) => setCategory(ev.target.value)}
        >
          <option value="">Uncategorized</option>
          {categories.length > 0 &&
            categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
        </select>
        {propertiesToFill.length > 0 &&
          propertiesToFill.map((p) => (
            <div key={p.name} className="">
              <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
              <div>
                <select
                  value={productProperties[p.name]}
                  onChange={(ev) => setProductProp(p.name, ev.target.value)}
                >
                  {p.values.map((v) => (
                    <option value={v} key={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        <label>Photos</label>
        <div className="mb-2 flex flex-wrap gap-1">
          <ReactSortable
            className="flex flex-wrap gap-1"
            list={images}
            setList={updateImagesOrder}
          >
            {!!images?.length &&
              images.map((link) => {
                const isPdf = link.endsWith(".pdf");
                const isVideo = link.endsWith(".mp4");

                return (
                  <div key={link} className="relative w-24 h-24 shadow-sm">
                    {isPdf || isVideo ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#5845f6"
                          className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#5845f6"
                          className="w-5 h-5 cursor-pointer absolute top-0 right-0 m-1"
                          onClick={() => removeImage(link)}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <img src={link} alt="" className="rounded-lg" />

                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="#5845f6"
                          className="w-5 h-5 cursor-pointer absolute top-0 right-0 m-1"
                          onClick={() => removeImage(link)}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </>
                    )}
                  </div>
                );
              })}
          </ReactSortable>
          {isUploading && (
            <div className="h-24 w-24 relative text-primary rounded-lg bg-white shadown-sm border border-gray-300">
              <div className="absolute top-0 right-0 m-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => cancelUpload.cancel()}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="flex items-center justify-center h-full">
                <div style={{ width: 40, height: 40 }}>
                  <CircularProgressbar
                    value={uploadProgress}
                    text={`${uploadProgress}%`}
                    strokeWidth={6}
                    styles={buildStyles({
                      pathColor: `rgba(62, 152, 199, ${uploadProgress / 100})`,
                      strokeLinecap: "round",
                      textColor: "#5845f6",
                      trailColor: "#d6d6d6",
                      backgroundColor: "#5845f6",
                    })}
                    textStyle={{
                      textAlign: "center",
                      dominantBaseline: "middle",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm text-primary rounded-lg bg-white shadown-sm border border-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>

            <div>Add img/pdf</div>
            <input type="file" className="hidden" onChange={uploadImages} />
          </label>
        </div>

        <label>Description</label>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label>Price</label>
        <input
          type="text"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <label>Discount Price</label>
        <input
          type="text"
          placeholder="Price"
          value={discountPrice}
          onChange={(e) => setDiscountPrice(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Save
        </button>
      </form>
    </div>
  );
}
