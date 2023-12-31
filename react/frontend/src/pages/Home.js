import React, { useEffect } from "react";
import Marquee from "react-fast-marquee";
import BlogCard from "../components/BlogCard";
import ProductCard from "../components/ProductCard";
import SpecialProduct from "../components/SpecialProduct";
import Container from "../components/Container";
import Meta from "../components/Meta";
import moment from "moment";
import mainBanner from "../images/main-banner.jpg";
import mainCover from "../images/cover.jpg";
import { useDispatch, useSelector } from "react-redux";
import{getAllBlogs} from "../features/blogs/blogSlice";
import { getAllProducts } from "../features/products/productSlice";
import ReactStars from "react-rating-stars-component";
import { Link, useLocation, useNavigate } from "react-router-dom";
import prodcompare from "../images/prodcompare.svg";
import wish from "../images/wish.svg";
import watch2 from "../images/watch1.jpg";
import addcart from "../images/add-cart.svg";
import view from "../images/view.svg";
import FilterModal from "../components/FilterModal";
import { addToWishlist } from "../features/products/productSlice";
import { toast } from "react-toastify";


//import { services } from "../";
const saveIdToLocal = (item) =>{
  console.log(item)
  if(localStorage.getItem("item1") == null){
    localStorage.setItem("item1" ,  JSON.stringify(item));
    toast.success("YOUR ITEM FIRST HAS BEEN ADDED TO CAMPARE PAGE");
  }else if(localStorage.getItem("item2") == null){
    localStorage.setItem("item2" , JSON.stringify(item));
    toast.success("YOUR ITEM FIRST HAS BEEN ADDED TO CAMPARE PAGE");
  }
}

const removeOver = () =>{
  const modalBackdrop = document.querySelector(".modal-backdrop.show");
  if (modalBackdrop !== null) {
    modalBackdrop.classList.remove("show");
    modalBackdrop.classList.add("d-none")
  }
}
const Home = () => {
  const blogState=useSelector((state)=>state.blog.blog);
  const productState=useSelector((state)=>state?.product?.product);
  const navigate=useNavigate()

  const dispatch = useDispatch();
  useEffect(()=>{
   getblogs();
   getallProducts();
   
   
  }, []);
  
  const getblogs =() =>{
    dispatch(getAllBlogs());
  };

  const getallProducts = () =>{
    dispatch(getAllProducts());
  };
  const addToWish= (id) =>{
    // alert(id);
    if(localStorage.getItem("token") != null){
      dispatch(addToWishlist(id));
      toast.success("YOUR ITEM HAS BEEN ADDED TO WISHLIST")
    }else{
      toast.error("PLEASE LOGIN")
    }

  };
  return (
    <>
    <Meta title={"Home"} />


    
              {/* <img
            
            src={mainBanner}
                className="h-banner-img"
                alt="main banner"
              /> */}
              <img
                src="images/back1.jpg"
                className="header-banner-img "
                alt="main banner"
                
              />
               <div className="main-banner-content position-absolute d-none d-sm-block">
                <h4>FOR YOUR SMART LIFE,</h4>
                <h5>EVERYTHINGS</h5>
                <p>YOU NEED</p>
                </div>
               <div className="mainn-banner-content-button position-absolute">
           
              <div className="col-12">
                  {/*<button className="btn btn-sm btn-warning" onClick={handleShow}>*/}
                  {/*        filter*/}
                  {/*</button>*/}
                <FilterModal></FilterModal>
              </div>
              </div>
              
          
     
      <Container class1="home-wrapper-2 py-5 d-none d-sm-block">
        <div className="row">
         
            <div className="servies d-flex align-items-center justify-content-between card-wrapper-service ">
           

              <div className="d-flex align-item-center gap-15">
                <img className= "d-none d-sm-block" src="images/service-02.png" />
                
                <div>
                <h5 class=" service-font d-none d-sm-block">24H SERVICE</h5>
        
                </div>
              </div>
              <div className="d-flex align-item-center ">
                <img className= "d-none d-sm-block" src="images/service-03.png" />
                
                <div>
                <h5 class=" service-font  d-none d-sm-block">CASH ON DELIVERY</h5>
        
                </div>
              </div>
              <div className="d-flex align-item-center gap-14">
                <img className= "d-none d-sm-block" src="images/service-04.png" />
                
                <div>
                <h5 class=" service-font  d-none d-sm-block">ISLAND WIDE DELIVERY</h5>
        
                </div>
              </div>
              <div className="d-flex align-item-center gap-14">
                <img className= "d-none d-sm-block" src="images/service-01.png" />
                
                <div>
                <h5 class=" service-font  d-none d-sm-block">QUALITY PRODUCTS</h5>
        
                </div>
              </div>

             
            </div>
          </div>
        
      </Container>  
      {/* <Container class1="home-wrapper-2 py-5">
        <div className="row">
          <div className="col-12">
            <div className="categories d-flex justify-content-between flex-wrap align-items-center">
              <div className="d-flex gap align-items-center">
                <div>
                  <h6>Music & Gaming</h6>
                  <p>10 Items</p>
                </div>
                <img src="images/camera.jpg" alt="camera" />
              </div>
              <div className="d-flex gap align-items-center">
                <div>
                  <h6>Cameras</h6>
                  <p>10 Items</p>
                </div>
                <img src="images/camera.jpg" alt="camera" />
              </div>
              <div className="d-flex gap align-items-center">
                <div>
                  <h6>Smart Tv</h6>
                  <p>10 Items</p>
                </div>
                <img src="images/tv.jpg" alt="camera" />
              </div>
              <div className="d-flex gap align-items-center">
                <div>
                  <h6>Smart Watches</h6>
                  <p>10 Items</p>
                </div>
                <img src="images/headphone.jpg" alt="camera" />
              </div>
              <div className="d-flex gap align-items-center">
                <div>
                  <h6>Music & Gaming</h6>
                  <p>10 Items</p>
                </div>
                <img src="images/camera.jpg" alt="camera" />
              </div>
              <div className="d-flex gap align-items-center">
                <div>
                  <h6>Cameras</h6>
                  <p>10 Items</p>
                </div>
                <img src="images/camera.jpg" alt="camera" />
              </div>
              <div className="d-flex gap align-items-center">
                <div>
                  <h6>Smart Tv</h6>
                  <p>10 Items</p>
                </div>
                <img src="images/tv.jpg" alt="camera" />
              </div>
              <div className="d-flex gap align-items-center">
                <div>
                  <h6>Smart Watches</h6>
                  <p>10 Items</p>
                </div>
                <img src="images/headphone.jpg" alt="camera" />
              </div>
            </div>
          </div>
        </div>
      </Container> */}
      <Container class1="featured-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h3 className="section-heading">Featured Collection</h3>
          </div>
          {productState && productState.length > 0 &&
          productState?.map((item,index)=>{
            if (item.tags === "featured"){
              const imageUrl = item?.images?.length > 0 ? item.images[0]?.url : "";
              return(
                <div
                key={index}
                className={
                  "col-xxl-3"
                }
              >
                <div
                
                  className="product-card position-relative"
                >
                  <div className="wishlist-icon position-absolute">
                  <button className="border-0 bg-transparent" onClick={(e)=>{addToWish(item?._id);
                }}>
                  <img src={wish} alt="wishlist" />
                </button>
                  </div>
                  <div className="product-image">
                    
                      <img
                        src={item?.images[0]?.url}
                        className="img-fluid mx-auto"
                        alt="product image"
                        width={300}
                      />
                   
                   <img src={imageUrl} className="img-fluid mx-auto" alt="product image" width={300} />
                  </div>
                  <div className="product-details">
                    <h6 className="brand"> {item?.brand}</h6>
                    <h5 className="product-title">{item?.title}</h5>
                    <ReactStars
                      count={5}
                      size={24}
                      value={item?.totalrating.toString()}
                      edit={false}
                      activeColor="#ffd700"
                    />
                    
                    <p className="price">RS.{item?.price}</p>
                  </div>
                  <div className="action-bar position-absolute">
                    <div className="d-flex flex-column gap-15">
                    <button className="border-0 bg-transparent" onClick={() => saveIdToLocal(item)}>
                    <img src={prodcompare} alt="compare" />
                  </button>
                      <button className="border-0 bg-transparent">
                        <img onClick={()=>navigate("/product/"+item?._id)} src={view} alt="view" />
                      </button>
                      {/* <button className="border-0 bg-transparent">
                        <img src={addcart} alt="addcart" />
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
              );
            }
          })}
         
        </div>
      </Container>

      {/* <Container class1="famous-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-3">
            <div className="famous-card position-relative">
              <img
                src="images/famous-1.webp"
                className="img-fluid"
                alt="famous"
              />
              <div className="famous-content position-absolute">
                <h5>Big Screen</h5>
                <h6>Smart Watch Series 7</h6> 
                <p>From Rs.45000</p>
              </div>
            </div>
          </div>

          <div className="col-3">
            <div className="famous-card position-relative">
              <img
                src="images/famous-3.webp"
                className="img-fluid"
                alt="famous"
              />
              <div className="famous-content position-absolute">
                <h5 className="text-dark">smartphones</h5>
                <h6 className="text-dark">Iphone 13 Pro.</h6>
                <p className="text-dark">
                   From Rs.325000
                </p>
              </div>
            </div>
          </div>
          <div className="col-3">
            <div className="famous-card position-relative">
              <img
                src="images/famous-2.jpg"
                className="img-fluid"
                alt="famous"
              />
              <div className="famous-content position-absolute">
                <h5 className="text-dark">HandFree</h5>
                <h6 className="text-dark">Quility sounds.</h6>
                <p className="text-dark">From Rs.1200</p>
              </div>
            </div>
          </div>
          
          <div className="col-3">
            <div className="famous-card position-relative">
              <img
                src="images/famous-3.webp"
                className="img-fluid"
                alt="famous"
              />
              <div className="famous-content position-absolute">
                <h5 className="text-dark">Iphone s</h5>
                <h6 className="text-dark">i phone 13</h6>
                <p className="text-dark">
                  From Rs.300000
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container> */}

      {/* <Container class1="special-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h3 className="section-heading">Special Products</h3>
          </div>
        </div>
        <div className="row">
          <SpecialProduct />
          <SpecialProduct />
          <SpecialProduct />
          <SpecialProduct />
        </div>
      </Container> */}

<Container class1="home-wrapper-2 py-4">
<div className="col-xxl-12">      
        <div className="row">
          <div className="col-xxl-6">
            <div className="main-banner position-relative ">
              <img
                src={mainCover}
                className="img-fluid rounded-3"
                alt="main banner"
                style={{ height: '420px', width:  '100%'}} 
                
              />
              {/* <div className="main-banner-content position-absolute">
                <h4>introducing.</h4>
                <h5>iphone 14</h5>
                <p>From Rs.325000</p>
                <Link className="button-main-banner">BUY NOW</Link>
              </div> */}
            </div>
          </div>

             <div className="col-xxl-3">
              <div className="small-banner-content position-absolut">
                <img
                  src="images/catbanner-01.png"
                  className="img-fluid rounded-3"
                  alt="main banner"
                />
               
             
              
              </div>
              <div className="col-xxl-12">
                <div className="small-banner-content position-absolut">
                <img
                  src="images/catbanner-04.png"
                  className="img-fluid rounded-3"
                  alt="main banner"
                />

              
                
              </div>
              </div>
              </div>
              <div className="col-xxl-3">
              <div className="small-banner-content position-absolut">
                <img
                  src="images/catbanner-02.png"
                  className="img-fluid rounded-3"
                  alt="main banner"
                />
              
              </div>
            
              <div className="col-xxl-12">
              <div className="small-banner-content position-absolut">
                <img
                  src="images/catbanner-03.png"
                  className="img-fluid rounded-3"
                  alt="main banner"
                />
               
              </div>
              </div>
              </div>
              </div>
            
          </div>
      
           
        
      </Container>

      <Container class1="popular-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h3 className="section-heading">Our Popular Products</h3>
          </div>
        </div>
        <div className="row">
          {productState && productState.length > 0 &&
          productState?.map((item,index)=>{
            if (item.tags === "popular"){
              const imageUrl = item?.images?.length > 0 ? item.images[0]?.url : "";
              return(
                <div
                key={index}
                className={
                  "col-xxl-3"
                }
              >
                <div
                 
                  className="product-card position-relative"
                >
                  <div className="wishlist-icon position-absolute">
                  <button className="border-0 bg-transparent" onClick={(e)=>{addToWish(item?._id);
                }}>
                  <img src={wish} alt="wishlist" />
                </button>
                  </div>
                  <div className="product-image">
                    
                      <img
                        src={item?.images[0]?.url}
                        className="img-fluid mx-auto"
                        alt="product image"
                        width={300}
                      />
                   
                   <img src={imageUrl} className="img-fluid mx-auto" alt="product image" width={300} />
                  </div>
                  <div className="product-details">
                    <h6 className="brand"> {item?.brand}</h6>
                    <h5 className="product-title">{item?.title}</h5>
                    <ReactStars
                      count={5}
                      size={24}
                      value={item?.totalrating.toString()}
                      edit={false}
                      activeColor="#ffd700"
                    />
                    
                    <p className="price">RS.{item?.price}</p>
                  </div>
                  <div className="action-bar position-absolute">
                    <div className="d-flex flex-column gap-15">
                    <button className="border-0 bg-transparent" onClick={() => saveIdToLocal(item)}>
                    <img src={prodcompare} alt="compare" />
                  </button>
                      <button className="border-0 bg-transparent">
                        <img onClick={()=>navigate("/product/"+item?._id)} src={view} alt="view" />
                      </button>
                      {/* <button className="border-0 bg-transparent">
                        <img src={addcart} alt="addcart" />
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
              );
            }
          })}

        
        </div>
      </Container>
      <Container class1="marque-wrapper home-wrapper-2 py-5">
        <div className="row">
          <div className="col-12">
            <div className="marquee-inner-wrapper card-wrapper">
              <Marquee className="d-flex">
                <div className="mx-4 w-25">
                  <img src="images/brand-01.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                  <img src="images/brand-02.png" alt="brand" />
                </div>
               
                <div className="mx-4 w-25">
                  <img src="images/brand-04.png" alt="brand" />
                </div>
                <div className="mx-4 w-25">
                  <img src="images/brand-05.png" alt="brand" />
                </div>
               
                <div className="mx-4 w-25">
                  <img src="images/brand-07.png" alt="brand" />
                </div>
                <div className="mx-4 w-25 ">
                  <img src="images/brand-08.png" alt="brand" />
                </div>
              </Marquee>
            </div>
          </div>
        </div>
      </Container>

      <Container class1="blog-wrapper py-5 home-wrapper-2">
        <div className="row">
          <div className="col-12">
            <h3 className="section-heading">Our Blogs</h3>
          </div>
        </div>
        <div className="row">
        {blogState &&
                blogState?.map((blog,index)=>{
                 if(index<3){
                  return(<div className="col-xxl-4 " key={index}>
                    <BlogCard
                      id={blog._id}
                      title={blog.title}
                      description={blog.description}
                      image={blog.image}
                      date={moment(blog?.createdAt).format("MMMM Do YYYY, h:mm: a")}
                    />
                </div>
                );
                 }
                })
              }
        </div>
      </Container>
    </>
  );
};

export default Home;