import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useContext, useEffect, useRef, useState } from "react";
import Rating from "@mui/material/Rating";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import {
  deleteData,
  deleteImages,
  fetchDataFromApi,
  postData,
  uploadImage,
} from "../../utils/api";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";
import { FaRegImages } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";
import OutlinedInput from "@mui/material/OutlinedInput";

import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import axios from "axios";
import CountryDropdown from "../../components/CountryDropdown";

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const ProductUpload = () => {
  const [categoryVal, setcategoryVal] = useState("");
  const [subCatVal, setSubCatVal] = useState("");

  const [productRams, setProductRAMS] = useState([]);
  const [productWeight, setProductWeight] = useState([]);
  const [productSize, setProductSize] = useState([]);

  const [productRAMSData, setProductRAMSData] = useState([]);
  const [productWEIGHTData, setProductWEIGHTData] = useState([]);
  const [productSIZEData, setProductSIZEData] = useState([]);

  const [ratingsValue, setRatingValue] = useState(1);
  const [isFeaturedValue, setisFeaturedValue] = useState("");

  const [catData, setCatData] = useState([]);
  const [subCatData, setSubCatData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [previews, setPreviews] = useState([]);

  const [isDisable, setIsDisable] = useState(true);

  const history = useNavigate();

  // Updated formFields to match new schema
  const [formFields, setFormFields] = useState({
    name: "",
    description: "",
    webmetag: "", // Added webmetag field
    brand: "",
    price: 0,
    oldPrice: 0,
    catName: "",
    catId: "",
    subCatId: "",
    subCat: "",
    subCatName: "",
    category: "",
    countInStock: 0,
    rating: 0,
    isFeatured: false,
    discount: 0,
    productRam: [],
    size: [],
    productWeight: [],
    location: "All",
  });

  const productImages = useRef();

  const context = useContext(MyContext);

  const formdata = new FormData();

  useEffect(() => {
    window.scrollTo(0, 0);
    setCatData(context.catData);

    fetchDataFromApi("/api/imageUpload").then((res) => {
      res?.map((item) => {
        item?.images?.map((img) => {
          deleteImages(`/api/category/deleteImage?img=${img}`).then((res) => {
            deleteData("/api/imageUpload/deleteAllImages");
          });
        });
      });
    });

    fetchDataFromApi("/api/productWeight").then((res) => {
      setProductWEIGHTData(res);
    });
    fetchDataFromApi("/api/productRAMS").then((res) => {
      setProductRAMSData(res);
    });
    fetchDataFromApi("/api/productSIZE").then((res) => {
      setProductSIZEData(res);
    });
  }, []);

  useEffect(() => {
    formFields.location = context.selectedCountry || "All";
  }, [context.selectedCountry]);

  useEffect(() => {
    const subCatArr = [];

    context.catData?.categoryList?.length !== 0 &&
      context.catData?.categoryList?.map((cat, index) => {
        if (cat?.children.length !== 0) {
          cat?.children?.map((subCat) => {
            subCatArr.push(subCat);
          });
        }
      });

    setSubCatData(subCatArr);
  }, [context.catData]);

  const handleChangeCategory = (event) => {
    setcategoryVal(event.target.value);
    setFormFields(() => ({
      ...formFields,
      category: event.target.value,
    }));
  };

  const handleChangeSubCategory = (event) => {
    setSubCatVal(event.target.value);
  };

  const checkSubCatName = (subCatName) => {
    formFields.subCatName = subCatName;
  };

  const handleChangeProductRams = (event) => {
    const {
      target: { value },
    } = event;
    setProductRAMS(typeof value === "string" ? value.split(",") : value);

    formFields.productRam = value;
  };

  const handleChangeProductWeight = (event) => {
    const {
      target: { value },
    } = event;
    setProductWeight(typeof value === "string" ? value.split(",") : value);

    formFields.productWeight = value;
  };

  const handleChangeProductSize = (event) => {
    const {
      target: { value },
    } = event;
    setProductSize(typeof value === "string" ? value.split(",") : value);

    formFields.size = value;
  };

  const handleChangeisFeaturedValue = (event) => {
    setisFeaturedValue(event.target.value);
    setFormFields(() => ({
      ...formFields,
      isFeatured: event.target.value,
    }));
  };

  const inputChange = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };

  const selectCat = (cat, id) => {
    formFields.catName = cat;
    formFields.catId = id;
  };

  const selectSubCat = (subCat, id) => {
    setFormFields(() => ({
      ...formFields,
      subCat: subCat,
      subCatName: subCat,
      subCatId: id,
    }));
  };

  let img_arr = [];
  let uniqueArray = [];

  const onChangeFile = async (e, apiEndPoint) => {
    try {
      const files = e.target.files;
      setUploading(true);

      for (var i = 0; i < files.length; i++) {
        if (
          files[i] &&
          (files[i].type === "image/jpeg" ||
            files[i].type === "image/jpg" ||
            files[i].type === "image/png" ||
            files[i].type === "image/webp")
        ) {
          const file = files[i];
          formdata.append(`images`, file);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Please select a valid JPG or PNG image file.",
          });

          setUploading(false);
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    }

    uploadImage(apiEndPoint, formdata).then((res) => {
      fetchDataFromApi("/api/imageUpload").then((response) => {
        if (
          response !== undefined &&
          response !== null &&
          response !== "" &&
          response.length !== 0
        ) {
          response.length !== 0 &&
            response.map((item) => {
              item?.images.length !== 0 &&
                item?.images?.map((img) => {
                  img_arr.push(img);
                });
            });

          uniqueArray = img_arr.filter(
            (item, index) => img_arr.indexOf(item) === index
          );

          const appendedArray = [...previews, ...uniqueArray];

          setPreviews(appendedArray);

          setTimeout(() => {
            setUploading(false);
            img_arr = [];
            context.setAlertBox({
              open: true,
              error: false,
              msg: "Images Uploaded!",
            });
          }, 500);
        }
      });
    });
  };

  const removeImg = async (index, imgUrl) => {
    const imgIndex = previews.indexOf(imgUrl);

    deleteImages(`/api/category/deleteImage?img=${imgUrl}`).then((res) => {
      context.setAlertBox({
        open: true,
        error: false,
        msg: "Image Deleted!",
      });
    });

    if (imgIndex > -1) {
      previews.splice(index, 1);
    }
  };

  const addProduct = (e) => {
    e.preventDefault();

    const appendedArray = [...previews, ...uniqueArray];

    img_arr = [];

    // Updated form validation and submission for new schema
    if (formFields.name === "") {
      context.setAlertBox({
        open: true,
        msg: "Please add product name",
        error: true,
      });
      return false;
    }

    if (formFields.description === "") {
      context.setAlertBox({
        open: true,
        msg: "Please add product description",
        error: true,
      });
      return false;
    }

    if (formFields.category === "") {
      context.setAlertBox({
        open: true,
        msg: "Please select a category",
        error: true,
      });
      return false;
    }

    if (formFields.countInStock <= 0) {
      context.setAlertBox({
        open: true,
        msg: "Please add valid product count in stock",
        error: true,
      });
      return false;
    }

    if (formFields.discount < 0) {
      context.setAlertBox({
        open: true,
        msg: "Please add valid product discount",
        error: true,
      });
      return false;
    }

    if (previews.length === 0) {
      context.setAlertBox({
        open: true,
        msg: "Please select images",
        error: true,
      });
      return false;
    }

    // Prepare data according to new schema
    const productData = {
      name: formFields.name,
      description: formFields.description,
      images: appendedArray,
      webmetag: formFields.webmetag || "",
      brand: formFields.brand || "",
      price: Number(formFields.price) || 0,
      oldPrice: Number(formFields.oldPrice) || 0,
      catName: formFields.catName || "",
      catId: formFields.catId || "",
      subCatId: formFields.subCatId || "",
      subCat: formFields.subCat || "",
      subCatName: formFields.subCatName || "",
      category: formFields.category,
      countInStock: Number(formFields.countInStock),
      rating: Number(formFields.rating) || 0,
      isFeatured: Boolean(formFields.isFeatured),
      discount: Number(formFields.discount) || 0,
      productRam: formFields.productRam || [],
      size: formFields.size || [],
      productWeight: formFields.productWeight || [],
      location: formFields.location || "All",
    };

    console.log("Product Data:", productData);

    setIsLoading(true);

    postData("/api/products/create", productData)
      .then((res) => {
        context.setAlertBox({
          open: true,
          msg: "The product is created!",
          error: false,
        });

        setIsLoading(false);
        deleteData("/api/imageUpload/deleteAllImages");

        history("/products");
      })
      .catch((error) => {
        console.error("Error creating product:", error);
        context.setAlertBox({
          open: true,
          msg: "Failed to create product. Please try again.",
          error: true,
        });
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Product Upload</h5>
          <Breadcrumbs aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb
              component="a"
              href="#"
              label="Dashboard"
              icon={<HomeIcon fontSize="small" />}
            />

            <StyledBreadcrumb
              component="a"
              label="Products"
              href="#"
              deleteIcon={<ExpandMoreIcon />}
            />
            <StyledBreadcrumb
              label="Product Upload"
              deleteIcon={<ExpandMoreIcon />}
            />
          </Breadcrumbs>
        </div>

        <form className="form" onSubmit={addProduct}>
          <div className="row">
            <div className="col-md-12">
              <div className="card p-4 mt-0">
                <h5 className="mb-4">Basic Information</h5>

                <div className="form-group">
                  <h6>PRODUCT NAME</h6>
                  <input
                    type="text"
                    name="name"
                    value={formFields.name}
                    onChange={inputChange}
                  />
                </div>

                <div className="form-group">
                  <h6>DESCRIPTION</h6>
                  <textarea
                    rows={5}
                    cols={10}
                    value={formFields.description}
                    name="description"
                    onChange={inputChange}
                  />
                </div>

                {/* Added webmetag field */}
                <div className="form-group">
                  <h6>WEBME PRODUCT TAG</h6>
                  <input
                    type="text"
                    name="webmetag"
                    value={formFields.webmetag}
                    onChange={inputChange}
                    placeholder="Enter webmedigital product connection tag for this item"
                  />
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>CATEGORY</h6>
                      <Select
                        value={categoryVal}
                        onChange={handleChangeCategory}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        className="w-100"
                      >
                        <MenuItem value="">
                          <em value={null}>None</em>
                        </MenuItem>
                        {context.catData?.categoryList?.length !== 0 &&
                          context.catData?.categoryList?.map((cat, index) => {
                            return (
                              <MenuItem
                                className="text-capitalize"
                                value={cat._id}
                                key={index}
                                onClick={() => selectCat(cat.name, cat._id)}
                              >
                                {cat.name}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>SUB CATEGORY</h6>
                      <Select
                        value={subCatVal}
                        onChange={handleChangeSubCategory}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        className="w-100"
                      >
                        <MenuItem value="">
                          <em value={null}>None</em>
                        </MenuItem>
                        {subCatData?.length !== 0 &&
                          subCatData?.map((subCat, index) => {
                            return (
                              <MenuItem
                                className="text-capitalize"
                                value={subCat._id}
                                key={index}
                                onClick={() =>
                                  selectSubCat(subCat.name, subCat._id)
                                }
                              >
                                {subCat.name}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>PRICE</h6>
                      <input
                        type="number"
                        name="price"
                        value={formFields.price}
                        onChange={inputChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>OLD PRICE</h6>
                      <input
                        type="number"
                        name="oldPrice"
                        value={formFields.oldPrice}
                        onChange={inputChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6 className="text-uppercase">IS FEATURED</h6>
                      <Select
                        value={isFeaturedValue}
                        onChange={handleChangeisFeaturedValue}
                        displayEmpty
                        inputProps={{ "aria-label": "Without label" }}
                        className="w-100"
                      >
                        <MenuItem value="">
                          <em value={null}>None</em>
                        </MenuItem>
                        <MenuItem value={true}>True</MenuItem>
                        <MenuItem value={false}>False</MenuItem>
                      </Select>
                    </div>
                  </div>

                  <div className="col">
                    <div className="form-group">
                      <h6>PRODUCT STOCK</h6>
                      <input
                        type="number"
                        name="countInStock"
                        value={formFields.countInStock}
                        onChange={inputChange}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <h6>BRAND</h6>
                      <input
                        type="text"
                        name="brand"
                        value={formFields.brand}
                        onChange={inputChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <h6>DISCOUNT</h6>
                      <input
                        type="number"
                        name="discount"
                        value={formFields.discount}
                        onChange={inputChange}
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <h6>PRODUCT RAMS</h6>
                      <Select
                        multiple
                        value={productRams}
                        onChange={handleChangeProductRams}
                        displayEmpty
                        className="w-100"
                        MenuProps={MenuProps}
                      >
                        {productRAMSData?.map((item, index) => {
                          return (
                            <MenuItem key={index} value={item.productRam}>
                              {item.productRam}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <h6>PRODUCT WEIGHT</h6>
                      <Select
                        multiple
                        value={productWeight}
                        onChange={handleChangeProductWeight}
                        displayEmpty
                        MenuProps={MenuProps}
                        className="w-100"
                      >
                        {productWEIGHTData?.map((item, index) => {
                          return (
                            <MenuItem key={index} value={item.productWeight}>
                              {item.productWeight}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <h6>PRODUCT SIZE</h6>
                      <Select
                        multiple
                        value={productSize}
                        onChange={handleChangeProductSize}
                        displayEmpty
                        MenuProps={MenuProps}
                        className="w-100"
                      >
                        {productSIZEData?.map((item, index) => {
                          return (
                            <MenuItem key={index} value={item.size}>
                              {item.size}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <h6>RATINGS</h6>
                      <Rating
                        name="simple-controlled"
                        value={ratingsValue}
                        onChange={(event, newValue) => {
                          setRatingValue(newValue);
                          setFormFields(() => ({
                            ...formFields,
                            rating: newValue,
                          }));
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <h6>LOCATION</h6>
                      {context.countryList?.length !== 0 && (
                        <CountryDropdown
                          countryList={context.countryList}
                          selectedLocation={context.selectedCountry}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4 mt-0">
            <div className="imagesUploadSec">
              <h5 className="mb-4">Media And Published</h5>

              <div className="imgUploadBox d-flex align-items-center">
                {previews?.length !== 0 &&
                  previews?.map((img, index) => {
                    return (
                      <div className="uploadBox" key={index}>
                        <span
                          className="remove"
                          onClick={() => removeImg(index, img)}
                        >
                          <IoCloseSharp />
                        </span>
                        <div className="box">
                          <LazyLoadImage
                            alt={"image"}
                            effect="blur"
                            className="w-100"
                            src={img}
                          />
                        </div>
                      </div>
                    );
                  })}

                <div className="uploadBox">
                  {uploading === true ? (
                    <div className="progressBar text-center d-flex align-items-center justify-content-center flex-column">
                      <CircularProgress />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          onChangeFile(e, "/api/products/upload")
                        }
                        name="images"
                      />
                      <div className="info">
                        <FaRegImages />
                        <h5>image upload</h5>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <br />

              <Button
                type="submit"
                disabled={uploading === true ? true : false}
                className="btn-blue btn-lg btn-big w-100"
              >
                <FaCloudUploadAlt /> &nbsp;{" "}
                {isLoading === true ? (
                  <CircularProgress color="inherit" className="loader" />
                ) : (
                  "PUBLISH AND VIEW"
                )}{" "}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProductUpload;
