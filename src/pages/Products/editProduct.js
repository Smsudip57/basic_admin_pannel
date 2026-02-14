import Breadcrumbs from "@mui/material/Breadcrumbs";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useContext, useEffect, useRef, useState } from "react";
import Rating from "@mui/material/Rating";
import { FaCloudUploadAlt } from "react-icons/fa";
import Button from "@mui/material/Button";
import {
  deleteData,
  deleteImages,
  editData,
  fetchDataFromApi,
  postData,
  uploadImage,
} from "../../utils/api";
import { MyContext } from "../../App";
import CircularProgress from "@mui/material/CircularProgress";
import { FaRegImages } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoCloseSharp } from "react-icons/io5";

import { Link, useParams } from "react-router-dom";
import TextEditor from "../../components/Shared/TextEditor";
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

const EditUpload = () => {
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

  const [product, setProducts] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);

  const [activeTab, setActiveTab] = useState(0);

  const [currentFeature, setCurrentFeature] = useState({
    featureCategory: "",
    featuresList: [],
  });
  const [currentFeatureName, setCurrentFeatureName] = useState("");
  const [currentFeatureValue, setCurrentFeatureValue] = useState(false);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  const [tempCategoryName, setTempCategoryName] = useState("");

  const [currentFAQ, setCurrentFAQ] = useState({
    question: "",
    answer: "",
  });

  const [currentSpecification, setCurrentSpecification] = useState({
    key: "",
    value: "",
  });

  let { id } = useParams();

  const history = useNavigate();

  // Updated formFields to include webmetag, features, faq, specifications
  const [formFields, setFormFields] = useState({
    name: "",
    description: "",
    webmetag: "",
    brand: "",
    price: null,
    oldPrice: null,
    catName: "",
    catId: "",
    subCatId: "",
    subCat: "",
    subCatName: "",
    category: "",
    countInStock: null,
    rating: 0,
    isFeatured: null,
    discount: 0,
    productRam: [],
    size: [],
    productWeight: [],
    location: "",
    features: [],
    faq: [],
    specifications: [],
  });

  const productImages = useRef();
  const context = useContext(MyContext);
  const formdata = new FormData();

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

  useEffect(() => {
    window.scrollTo(0, 0);

    context.setselectedCountry("");
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

    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      console.log(res);
      setProducts(res);

      // Updated to include webmetag
      setFormFields({
        name: res.name,
        description: res.description,
        webmetag: res.webmetag || "",
        brand: res.brand,
        price: res.price,
        oldPrice: res.oldPrice,
        catName: res.catName,
        category: res.category,
        catId: res.catId,
        subCat: res.subCat,
        subCatName: res.subCatName,
        subCatId: res.subCatId,
        countInStock: res.countInStock,
        rating: res.rating,
        isFeatured: res.isFeatured,
        discount: res.discount,
        productRam: res.productRam,
        size: res.size,
        productWeight: res.productWeight,
        location: res.location,
        features: res.features || [],
        faq: res.faq || [],
        specifications: res.specifications || [],
      });

      context.setselectedCountry(res.location);
      setRatingValue(res.rating);
      setcategoryVal(res.category?._id);
      setSubCatVal(res.subCatId);
      setisFeaturedValue(res.isFeatured);
      setProductRAMS(res.productRam);
      setProductSize(res.size);
      setProductWeight(res.productWeight);
      setPreviews(res.images);
      setVideoPreviews(res.videos || []);
      setSelectedThumbnail(res.thumbnail || null);
      context.setProgress(100);
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

  const handleChangeCategory = (event) => {
    setcategoryVal(event.target.value);
    setFormFields(() => ({
      ...formFields,
      category: event.target.value,
    }));
  };

  const handleChangeSubCategory = (event) => {
    setSubCatVal(event.target.value);
    formFields.subCatId = event.target.value;
  };

  const checkSubCatName = (subCatName) => {
    formFields.subCatName = subCatName;
  };

  const handleChangeisFeaturedValue = (event) => {
    setisFeaturedValue(event.target.value);
    setFormFields(() => ({
      ...formFields,
      isFeatured: event.target.value,
    }));
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
            (item, index) => img_arr.indexOf(item) === index,
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
    deleteImages(`/api/category/deleteImage?img=${imgUrl}`).then((res) => {
      context.setAlertBox({
        open: true,
        error: false,
        msg: "Image Deleted!",
      });
    });

    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
  };

  const onChangeFileVideo = async (e) => {
    try {
      const files = e.target.files;
      setUploading(true);
      const videoFormData = new FormData();

      for (var i = 0; i < files.length; i++) {
        if (
          files[i] &&
          (files[i].type === "video/mp4" ||
            files[i].type === "video/webm" ||
            files[i].type === "video/quicktime" ||
            files[i].type === "video/x-msvideo" ||
            files[i].name.endsWith(".mkv"))
        ) {
          const file = files[i];
          videoFormData.append(`videos`, file);
        } else {
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Please select valid video files (mp4, webm, mov, avi, mkv).",
          });

          setUploading(false);
          return false;
        }
      }

      uploadImage("/api/products/uploadVideo", videoFormData)
        .then((res) => {
          console.log("Video upload response:", res);

          if (res && res.length > 0) {
            const appendedVideos = [...videoPreviews, ...res];
            setVideoPreviews(appendedVideos);

            context.setAlertBox({
              open: true,
              error: false,
              msg: "Videos Uploaded!",
            });
          } else {
            context.setAlertBox({
              open: true,
              error: true,
              msg: "Upload failed or no videos returned",
            });
          }
        })
        .catch((error) => {
          console.error("Video upload error:", error);
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Error uploading videos",
          });
        })
        .finally(() => {
          setUploading(false);
        });
    } catch (error) {
      console.log(error);
      setUploading(false);
    }
  };

  const removeVideo = async (index, videoUrl) => {
    deleteImages(`/api/category/deleteImage?img=${videoUrl}`).then((res) => {
      context.setAlertBox({
        open: true,
        error: false,
        msg: "Video Deleted!",
      });
    });

    const updatedVideos = videoPreviews.filter((_, i) => i !== index);
    setVideoPreviews(updatedVideos);
  };

  const setThumbnailHandler = (imageUrl) => {
    setSelectedThumbnail(imageUrl);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const addFeature = () => {
    if (!currentFeatureName.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please enter feature name",
      });
      return;
    }

    const updatedFeatures = [...formFields.features];
    updatedFeatures[editingCategoryIndex].featuresList.push({
      featuresName: currentFeatureName,
      value: currentFeatureValue,
    });

    setFormFields(() => ({
      ...formFields,
      features: updatedFeatures,
    }));

    setCurrentFeatureName("");
    setCurrentFeatureValue(false);

    context.setAlertBox({
      open: true,
      error: false,
      msg: "Feature added successfully",
    });
  };

  const createFeatureCategory = () => {
    if (!tempCategoryName.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please enter category name",
      });
      return;
    }

    const newCategory = {
      featureCategory: tempCategoryName,
      featuresList: [],
    };

    const updatedFeatures = [...formFields.features, newCategory];
    setFormFields(() => ({
      ...formFields,
      features: updatedFeatures,
    }));

    setEditingCategoryIndex(updatedFeatures.length - 1);
    setTempCategoryName("");
    setCurrentFeatureName("");
    setCurrentFeatureValue(false);

    context.setAlertBox({
      open: true,
      error: false,
      msg: "Category created. Now add features to it!",
    });
  };

  const removeFeature = (categoryIndex, featureIndex) => {
    const updatedFeatures = [...formFields.features];

    if (featureIndex !== null) {
      updatedFeatures[categoryIndex].featuresList.splice(featureIndex, 1);

      if (updatedFeatures[categoryIndex].featuresList.length === 0) {
        updatedFeatures.splice(categoryIndex, 1);
        setEditingCategoryIndex(null);
      }
    } else {
      updatedFeatures.splice(categoryIndex, 1);
      setEditingCategoryIndex(null);
    }

    setFormFields(() => ({
      ...formFields,
      features: updatedFeatures,
    }));
  };

  const toggleFeatureValue = (categoryIndex, featureIndex) => {
    const updatedFeatures = [...formFields.features];
    updatedFeatures[categoryIndex].featuresList[featureIndex].value =
      !updatedFeatures[categoryIndex].featuresList[featureIndex].value;

    setFormFields(() => ({
      ...formFields,
      features: updatedFeatures,
    }));
  };

  const startEditingCategory = (categoryIndex) => {
    setEditingCategoryIndex(categoryIndex);
    setCurrentFeatureName("");
    setCurrentFeatureValue(false);
  };

  const cancelEditingCategory = () => {
    setEditingCategoryIndex(null);
    setCurrentFeatureName("");
    setCurrentFeatureValue(false);
    setTempCategoryName("");
  };

  const addFAQ = () => {
    if (!currentFAQ.question.trim() || !currentFAQ.answer.trim()) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please enter both question and answer",
      });
      return;
    }

    const updatedFAQ = [...formFields.faq, currentFAQ];
    setFormFields(() => ({
      ...formFields,
      faq: updatedFAQ,
    }));

    setCurrentFAQ({ question: "", answer: "" });

    context.setAlertBox({
      open: true,
      error: false,
      msg: "FAQ added successfully",
    });
  };

  const removeFAQ = (index) => {
    const updatedFAQ = formFields.faq.filter((_, i) => i !== index);
    setFormFields(() => ({
      ...formFields,
      faq: updatedFAQ,
    }));
  };

  const addSpecification = () => {
    if (
      !currentSpecification.key.trim() ||
      !currentSpecification.value.trim()
    ) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please enter both specification key and value",
      });
      return;
    }

    const updatedSpecs = [...formFields.specifications, currentSpecification];
    setFormFields(() => ({
      ...formFields,
      specifications: updatedSpecs,
    }));

    setCurrentSpecification({ key: "", value: "" });

    context.setAlertBox({
      open: true,
      error: false,
      msg: "Specification added successfully",
    });
  };

  const removeSpecification = (index) => {
    const updatedSpecs = formFields.specifications.filter(
      (_, i) => i !== index,
    );
    setFormFields(() => ({
      ...formFields,
      specifications: updatedSpecs,
    }));
  };

  useEffect(() => {
    formFields.location = context.selectedCountry;
  }, [context.selectedCountry]);

  // Updated edit_Product function to use the new schema and endpoint
  const edit_Product = (e) => {
    e.preventDefault();

    const appendedArray = [...previews, ...uniqueArray];
    img_arr = [];

    // Updated form validation
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

    setIsLoading(true);

    // Prepare data according to updated schema
    const updatedProductData = {
      name: formFields.name,
      description: formFields.description,
      images: appendedArray,
      videos: videoPreviews || [],
      thumbnail: selectedThumbnail || appendedArray[0] || null,
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
      features: formFields.features || [],
      faq: formFields.faq || [],
      specifications: formFields.specifications || [],
    };

    console.log("Updated Product Data:", updatedProductData);

    // Use PUT request with updated endpoint
    editData(`/api/products/${id}`, updatedProductData)
      .then((res) => {
        context.setAlertBox({
          open: true,
          msg: "The product is updated!",
          error: false,
        });

        setIsLoading(false);
        deleteData("/api/imageUpload/deleteAllImages");
        history("/products");
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        context.setAlertBox({
          open: true,
          msg: "Failed to update product. Please try again.",
          error: true,
        });
        setIsLoading(false);
      });
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Product Edit</h5>
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
              label="Product Edit"
              deleteIcon={<ExpandMoreIcon />}
            />
          </Breadcrumbs>
        </div>

        <form className="form" onSubmit={edit_Product}>
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
                  <TextEditor
                    value={formFields.description}
                    onChange={(content) =>
                      setFormFields({
                        ...formFields,
                        description: content,
                      })
                    }
                    placeholder="Enter product description here..."
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

                      {categoryVal !== "" && (
                        <Select
                          value={categoryVal}
                          onChange={handleChangeCategory}
                          displayEmpty
                          inputProps={{ "aria-label": "Without label" }}
                          className="w-100"
                        >
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
                      )}
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
                                onClick={() => checkSubCatName(subCat.name)}
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
            <h5 className="mb-4">Product Details</h5>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="product details tabs"
              >
                <Tab label="Specifications" />
                <Tab label="Features" />
                <Tab label="FAQs" />
              </Tabs>
            </Box>

            {/* SPECIFICATIONS TAB */}
            {activeTab === 0 && (
              <Box sx={{ p: 2 }}>
                <h6 className="mt-3 mb-3">Product Specifications & Variants</h6>

                <div className="row mb-3">
                  <div className="col-md-6">
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

                  <div className="col-md-6">
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
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
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
                </div>

                <hr />

                <h6 className="mt-4 mb-3">Custom Specifications</h6>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Specification Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Stand Up, Frame, Weight Capacity"
                        value={currentSpecification.key}
                        onChange={(e) =>
                          setCurrentSpecification({
                            ...currentSpecification,
                            key: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Specification Value</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., 35″L x 24″W x 37-45″H, 60 LBS"
                        value={currentSpecification.value}
                        onChange={(e) =>
                          setCurrentSpecification({
                            ...currentSpecification,
                            value: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={addSpecification}
                  className="btn-blue mb-4"
                  variant="contained"
                >
                  Add Specification
                </Button>

                {formFields.specifications.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3">Added Specifications</h6>
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Value</th>
                            <th style={{ width: "100px" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formFields.specifications.map((spec, index) => (
                            <tr key={index}>
                              <td>
                                <strong>{spec.key}</strong>
                              </td>
                              <td>{spec.value}</td>
                              <td>
                                <Button
                                  color="error"
                                  size="small"
                                  onClick={() => removeSpecification(index)}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Box>
            )}

            {/* FEATURES TAB */}
            {activeTab === 1 && (
              <Box sx={{ p: 3, pb: 6 }}>
                <h6
                  className="mt-0 mb-4"
                  style={{ fontSize: "16px", fontWeight: 600 }}
                >
                  Add Product Features
                </h6>

                {editingCategoryIndex === null ? (
                  <div
                    className="card p-4 mb-4"
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "2px dashed #dee2e6",
                      borderRadius: "8px",
                    }}
                  >
                    <h6
                      className="mb-3"
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#495057",
                      }}
                    >
                      Step 1: Create Feature Category
                    </h6>
                    <div className="row mb-3">
                      <div className="col-md-8">
                        <div className="form-group mb-0">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="e.g., Performance, Design, Battery, Safety"
                            value={tempCategoryName}
                            onChange={(e) =>
                              setTempCategoryName(e.target.value)
                            }
                            style={{ borderRadius: "6px" }}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <Button
                          onClick={createFeatureCategory}
                          className="btn-blue w-100"
                          variant="contained"
                          style={{ height: "38px", borderRadius: "6px" }}
                        >
                          Create Category
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {formFields.features.length > 0 && (
                  <div className="mt-4">
                    <h6
                      className="mb-4"
                      style={{ fontSize: "15px", fontWeight: 600 }}
                    >
                      Your Feature Categories ({formFields.features.length})
                    </h6>
                    {formFields.features.map((feature, categoryIndex) => (
                      <div
                        key={categoryIndex}
                        className="card p-4 mb-3"
                        style={{
                          backgroundColor:
                            editingCategoryIndex === categoryIndex
                              ? "#ffffff"
                              : "#ffffff",
                          borderLeft:
                            editingCategoryIndex === categoryIndex
                              ? "5px solid #0d6efd"
                              : "5px solid #dee2e6",
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5
                              className="mb-1 text-primary"
                              style={{ fontSize: "16px", fontWeight: 600 }}
                            >
                              {feature.featureCategory}
                            </h5>
                            <small className="text-muted">
                              {feature.featuresList.length} feature
                              {feature.featuresList.length !== 1
                                ? "s"
                                : ""}{" "}
                              added
                            </small>
                          </div>
                          <div className="d-flex gap-2" style={{ gap: "16px" }}>
                            {editingCategoryIndex !== categoryIndex && (
                              <Button
                                size="small"
                                className="btn-blue"
                                variant="contained"
                                onClick={() =>
                                  startEditingCategory(categoryIndex)
                                }
                                style={{
                                  borderRadius: "6px",
                                  padding: "6px 14px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                }}
                              >
                                Add Features
                              </Button>
                            )}
                            <Button
                              size="small"
                              onClick={() => removeFeature(categoryIndex, null)}
                              style={{
                                borderRadius: "6px",
                                padding: "6px 14px",
                                fontSize: "12px",
                                fontWeight: 600,
                                backgroundColor: "#fff5f5",
                                color: "#dc3545",
                                border: "1px solid #dc3545",
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>

                        {editingCategoryIndex === categoryIndex && (
                          <div
                            className="mb-4 p-3"
                            style={{
                              backgroundColor: "#f8f9fa",
                              border: "1px solid #dee2e6",
                              borderRadius: "6px",
                            }}
                          >
                            <h6
                              className="mb-3"
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#495057",
                              }}
                            >
                              Add New Feature
                            </h6>
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <div className="form-group mb-0">
                                  <label
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Feature Name
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g., Wireless, Fast Charging"
                                    value={currentFeatureName}
                                    onChange={(e) =>
                                      setCurrentFeatureName(e.target.value)
                                    }
                                    style={{
                                      borderRadius: "6px",
                                      fontSize: "13px",
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="col-md-6">
                                <div className="form-group mb-0">
                                  <label
                                    style={{
                                      fontSize: "12px",
                                      fontWeight: 600,
                                      display: "block",
                                      marginBottom: "6px",
                                    }}
                                  >
                                    Include Feature
                                  </label>
                                  <label
                                    className="d-flex align-items-center gap-2 mb-0"
                                    style={{ cursor: "pointer", gap: "12px" }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={currentFeatureValue}
                                      onChange={(e) =>
                                        setCurrentFeatureValue(e.target.checked)
                                      }
                                      style={{
                                        cursor: "pointer",
                                        width: "16px",
                                        height: "16px",
                                        accentColor: "#0d6efd",
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        color: currentFeatureValue
                                          ? "#155724"
                                          : "#6c757d",
                                      }}
                                    >
                                      {currentFeatureValue
                                        ? "Yes, Include"
                                        : "No, Exclude"}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div
                              className="d-flex gap-2"
                              style={{ gap: "16px" }}
                            >
                              <Button
                                onClick={addFeature}
                                className="btn-blue"
                                variant="contained"
                                size="small"
                                style={{
                                  borderRadius: "6px",
                                  padding: "5px 12px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                }}
                              >
                                Add Feature
                              </Button>
                              <Button
                                onClick={cancelEditingCategory}
                                variant="contained"
                                size="small"
                                style={{
                                  borderRadius: "6px",
                                  padding: "5px 12px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  backgroundColor: "#6c757d",
                                  color: "#ffffff",
                                  border: "none",
                                }}
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        )}

                        {feature.featuresList.length > 0 && (
                          <div className="table-responsive">
                            <table
                              className="table table-sm mb-0"
                              style={{ marginBottom: 0 }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    backgroundColor: "#f8f9fa",
                                    borderTop: "1px solid #dee2e6",
                                  }}
                                >
                                  <th
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "13px",
                                      color: "#495057",
                                    }}
                                  >
                                    Feature Name
                                  </th>
                                  <th
                                    style={{
                                      width: "140px",
                                      fontWeight: 600,
                                      fontSize: "13px",
                                      color: "#495057",
                                    }}
                                  >
                                    Status
                                  </th>
                                  <th
                                    style={{
                                      width: "80px",
                                      fontWeight: 600,
                                      fontSize: "13px",
                                      color: "#495057",
                                    }}
                                  >
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {feature.featuresList.map(
                                  (item, featureIndex) => (
                                    <tr
                                      key={featureIndex}
                                      style={{
                                        borderBottom: "1px solid #dee2e6",
                                      }}
                                    >
                                      <td
                                        style={{
                                          paddingTop: "12px",
                                          paddingBottom: "12px",
                                        }}
                                      >
                                        <strong style={{ color: "#212529" }}>
                                          {item.featuresName}
                                        </strong>
                                      </td>
                                      <td
                                        style={{
                                          paddingTop: "12px",
                                          paddingBottom: "12px",
                                        }}
                                      >
                                        <label
                                          className="d-flex align-items-center gap-2 mb-0"
                                          style={{ gap: "10px" }}
                                        >
                                          <input
                                            type="checkbox"
                                            checked={item.value}
                                            onChange={() =>
                                              toggleFeatureValue(
                                                categoryIndex,
                                                featureIndex,
                                              )
                                            }
                                            style={{
                                              cursor: "pointer",
                                              width: "18px",
                                              height: "18px",
                                              accentColor: "#0d6efd",
                                            }}
                                          />
                                          <span
                                            style={{
                                              color: item.value
                                                ? "#28a745"
                                                : "#dc3545",
                                              fontWeight: "bold",
                                              fontSize: "13px",
                                            }}
                                          >
                                            {item.value
                                              ? "Included"
                                              : "Not Included"}
                                          </span>
                                        </label>
                                      </td>
                                      <td
                                        style={{
                                          paddingTop: "12px",
                                          paddingBottom: "12px",
                                        }}
                                      >
                                        <Button
                                          size="small"
                                          onClick={() =>
                                            removeFeature(
                                              categoryIndex,
                                              featureIndex,
                                            )
                                          }
                                          style={{
                                            fontSize: "12px",
                                            borderRadius: "4px",
                                            backgroundColor: "#f8f9fa",
                                            color: "#dc3545",
                                            border: "1px solid #dc3545",
                                            fontWeight: 600,
                                            padding: "4px 10px",
                                          }}
                                        >
                                          Remove
                                        </Button>
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Box>
            )}

            {/* FAQs TAB */}
            {activeTab === 2 && (
              <Box sx={{ p: 2 }}>
                <h6 className="mt-3 mb-3">Add Frequently Asked Questions</h6>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Question</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter the question"
                        value={currentFAQ.question}
                        onChange={(e) =>
                          setCurrentFAQ({
                            ...currentFAQ,
                            question: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <div className="form-group">
                      <label>Answer</label>
                      <textarea
                        rows={4}
                        className="form-control"
                        placeholder="Enter the answer"
                        value={currentFAQ.answer}
                        onChange={(e) =>
                          setCurrentFAQ({
                            ...currentFAQ,
                            answer: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={addFAQ}
                  className="btn-blue mb-4"
                  variant="contained"
                >
                  Add FAQ
                </Button>

                {formFields.faq.length > 0 && (
                  <div className="mt-4">
                    <h6 className="mb-3">Added FAQs</h6>
                    {formFields.faq.map((item, index) => (
                      <div
                        key={index}
                        className="card p-3 mb-2"
                        style={{ backgroundColor: "#f9f9f9" }}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div style={{ flex: 1 }}>
                            <h6 className="mb-2">Q: {item.question}</h6>
                            <p className="mb-0" style={{ color: "#666" }}>
                              A: {item.answer}
                            </p>
                          </div>
                          <Button
                            color="error"
                            size="small"
                            onClick={() => removeFAQ(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Box>
            )}
          </div>

          <div className="card p-4 mt-0">
            <div className="imagesUploadSec">
              <h5 className="mb-4">Media And Published</h5>

              <div className="imgUploadBox d-flex align-items-center flex-wrap">
                {/* Display Images */}
                {previews?.length !== 0 &&
                  previews?.map((img, index) => {
                    return (
                      <div
                        className="uploadBox"
                        key={index}
                        style={{ position: "relative" }}
                      >
                        <span
                          className="remove"
                          onClick={() => removeImg(index, img)}
                        >
                          <IoCloseSharp />
                        </span>
                        <div className="box">
                          <LazyLoadImage
                            alt="product image"
                            effect="blur"
                            className="w-100"
                            src={img}
                          />
                        </div>
                        {/* Thumbnail Selection Button */}
                        {selectedThumbnail !== img && (
                          <Button
                            size="small"
                            onClick={() => setThumbnailHandler(img)}
                            style={{
                              position: "absolute",
                              bottom: "5px",
                              left: "5px",
                              fontSize: "10px",
                              padding: "3px 8px",
                              backgroundColor: "rgba(255,255,255,0.9)",
                              color: "#0d6efd",
                              border: "1px solid #0d6efd",
                              fontWeight: "600",
                            }}
                          >
                            Set as Thumbnail
                          </Button>
                        )}
                        {selectedThumbnail === img && (
                          <div
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              backgroundColor: "#28a745",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                          >
                            ✓ Thumbnail
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Display Videos */}
                {videoPreviews?.length !== 0 &&
                  videoPreviews?.map((video, index) => {
                    return (
                      <div
                        className="uploadBox"
                        key={`video-${index}`}
                        style={{ position: "relative" }}
                      >
                        <span
                          className="remove"
                          onClick={() => removeVideo(index, video)}
                        >
                          <IoCloseSharp />
                        </span>
                        <div className="box">
                          <video
                            width="100%"
                            height="auto"
                            style={{ objectFit: "cover" }}
                          >
                            <source src={video} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              color: "white",
                              fontSize: "12px",
                              fontWeight: "bold",
                              backgroundColor: "rgba(0,0,0,0.5)",
                              padding: "4px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            VIDEO
                          </div>
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Image Upload */}
                      <div>
                        <input
                          type="file"
                          multiple
                          onChange={(e) =>
                            onChangeFile(e, "/api/products/upload")
                          }
                          name="images"
                          accept="image/*"
                        />
                        <div className="info">
                          <FaRegImages />
                          <h5>image upload</h5>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Upload Box */}
                <div className="uploadBox">
                  {uploading === true ? (
                    <div className="progressBar text-center d-flex align-items-center justify-content-center flex-column">
                      <CircularProgress />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {/* Video Upload */}
                      <div>
                        <input
                          type="file"
                          multiple
                          onChange={onChangeFileVideo}
                          name="videos"
                          accept="video/*"
                        />
                        <div className="info">
                          <FaCloudUploadAlt />
                          <h5>video upload</h5>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <br />

              <Button type="submit" className="btn-blue btn-lg btn-big w-100">
                <FaCloudUploadAlt /> &nbsp;{" "}
                {isLoading === true ? (
                  <CircularProgress color="inherit" className="loader" />
                ) : (
                  "UPDATE PRODUCT"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditUpload;
